import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { simpleGit, CleanOptions } from 'simple-git';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import { fileTypeFromBuffer } from 'file-type';

const prefix = 'storage';
const _storage = path.join(__dirname, 'data');

const git = simpleGit(_storage, {
	maxConcurrentProcesses: 10,
	trimmed: true,
}).clean(CleanOptions.FORCE);

const mod = {

	etag: async (gitPath, isFolder) => (await git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', gitPath))).trim().split('\n').shift(),

	fakeJSON (e) {
		if (!['{', '['].includes(e.trim()[0]))
			return false;

		try {
			return JSON.parse(e);
		} catch (e) {
			return false
		}
	},

	async guessMimeType (data) {
		const mime = await fileTypeFromBuffer(data);
		if (mime)
			return mime.mime;
		
		return mod.fakeJSON(data.toString()) ? 'application/json' : 'text/plain';
	},

	_parseToken: e => (!e || !e.trim()) ? null : e.split('Bearer ').pop(),

	handler: adapter => async (req, res, next) => {
		// console.info(req.method, req.url);
		if (req.url.toLowerCase().match('/.well-known/webfinger'))
			return res.json({
				links: [{
					rel: 'remotestorage',
					href: `${ req.protocol }://${ req.get('host') }/me/${ prefix }`,
					type: 'draft-dejong-remotestorage-02',
				}],
			});

		// await git.pull('origin');
		const [handle, _url] = req.url.match(new RegExp(`^\\/(\\w+)\\/${ prefix }(.*)`)).slice(1);
		const token = mod._parseToken(req.headers.authorization);

		if (!token)
			return res.status(401).end();

		const permissions = await adapter.permissions(handle, token);

		if (!permissions)
			return res.status(401).end();

		const scope = _url.match(/^\/[^\/]+\//).shift()
		// if (!Object.keys(permissions).includes(`/${ scope }/`))
		// 	return res.status(401).end();

		if (['PUT', 'DELETE'].includes(req.method) && !permissions[scope].includes('w'))
			return res.status(401).end();

		res.set({
			'Access-Control-Allow-Origin': req.headers['origin'] || '*',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag',	
		});

		if (req.method === 'OPTIONS')
			return res.set({
				'Access-Control-Allow-Methods': 'OPTIONS, GET, HEAD, PUT, DELETE',
				'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',				
			}).status(204).end();

		if (req.method === 'PUT' && req.headers['content-range'])
				return res.status(400).end();

		const target = adapter.dataPath(handle, _url);
		
		if (req.method === 'PUT' && fs.existsSync(target) && fs.statSync(target).isDirectory())
			return res.status(409).end();

		const _folders = _url.split('/').slice(0, -1).reduce((coll, item) => {
			return coll.concat(`${ coll.at(-1) || '' }/${ item }`);
		}, []).map(e => adapter.dataPath(handle, e));
		if (req.method === 'PUT' && !fs.existsSync(target))
			if (_folders.filter(e => fs.existsSync(e) && fs.statSync(e).isFile()).length)
				return res.status(409).end();

		const isFolder = req.url.endsWith('/');
		const gitPath = `.${ _url }`;
		const meta = await adapter.meta(git, gitPath, isFolder, target);

		if (['PUT', 'DELETE'].includes(req.method) && (
			!fs.existsSync(target) && req.headers['if-match']
			|| fs.existsSync(target) && req.headers['if-match'] && req.headers['if-match'] !== meta.ETag
			|| fs.existsSync(target) && req.headers['if-none-match']
			))
			return res.status(412).end();

		if (['HEAD', 'GET', 'DELETE'].includes(req.method) && !fs.existsSync(target))
			return res.status(404).send('Not found');

		if (req.method === 'GET' && fs.existsSync(target) && req.headers['if-none-match'])
			if (req.headers['if-none-match'].split(',').map(e => e.trim()).includes(meta.ETag))
				return res.status(304).end();

		if (req.method === 'PUT') {
			fs.mkdirSync(path.dirname(target), { recursive: true });
			await adapter.putParents(_folders);

			fs.writeFileSync(target, req.headers['content-type'] === 'application/json' ? JSON.stringify(req.body) : req.body);
			await adapter.putChild(target, meta);

			await git.add('./*')
				.commit('sync')
				// .push('origin');
		}

		const data = isFolder ? null : fs.readFileSync(target);

		const _meta = Object.assign(req.method === 'PUT' ? await adapter.meta(git, gitPath, isFolder, target) : meta, {
			'Content-Type': isFolder ? 'application/ld+json' : await mod.guessMimeType(data),
		});

		if (!isFolder)
			_meta['Content-Length'] = fs.statSync(target).size;

		res.set(_meta).status(200);

		if (req.method === 'HEAD')
			return res.end();

		if (req.method === 'DELETE') {
			fs.unlinkSync(target);

			await git.add('./*')
				.commit('sync')
				// .push('origin');

			return res.end();
		}

		if (!isFolder)
			return res.send(_meta['Content-Type'] === 'application/json' ? fs.readFileSync(target, 'utf8') : data);

		const tree = (await git.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', gitPath)).trim();
		return res.json({
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: !tree.length ? {} : tree.split('\n').map(e => {
				const [type, hash, size, path] = e.split(/\s+/);
				return {
					name: type === 'tree' ? `${ path }/` : path,
					type,
					hash,
					size: size === '-' ? null : parseInt(size),
				};
			}).reduce((coll, item) => {
				coll[item.name.match(new RegExp(`^${ _url.slice(1) }(.*)`)).pop()] = Object.assign(item.type === 'tree' ? {} : {
					'Content-Length': item.size,
					'Content-Type': mime.getType(path.join(_url, item.name)) || 'application/json',
				}, {
					ETag: item.hash,
				});

				return coll;
			}, {}),
		});
	},

};

export default mod;
