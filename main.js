import fs from 'fs';
import path from 'path';
import mime from 'mime';
import { simpleGit, CleanOptions } from 'simple-git';

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prefix = '/storage';
const _storage = path.join(__dirname, 'data');

const git = simpleGit(_storage, {
	maxConcurrentProcesses: 10,
	trimmed: true,
}).clean(CleanOptions.FORCE);

const mod = {

	_relativePath: (url, prefix) => url.split(prefix).slice(1).join(prefix),

	etag: async (gitPath, isFolder) => (await git.raw(...['ls-tree', '--object-only'].concat(isFolder ? '-t' : []).concat('HEAD', gitPath))).trim().split('\n').shift(),

	async handle (req, res, next) {
		// await git.pull('origin');
		const isFolder = req.url.endsWith('/');
		const _url = req.url.split(new RegExp(`^\\${ prefix }`)).pop();
		const target = path.join(_storage, _url);
		
		if (req.url.toLowerCase().match('/.well-known/webfinger'))
			return res.json({
				links: [{
					rel: 'remotestorage',
					href: req.protocol + '://' + req.get('host') + prefix,
					type: 'draft-dejong-remotestorage-02',
				}],
			});

		if (!req.headers.authorization)
			return res.status(401).send('Unauthorized');

		res.set({
			'Access-Control-Allow-Origin': req.headers['origin'] || '*',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag',	
		});

		if (req.method === 'OPTIONS')
			return res.set({
				'Access-Control-Allow-Methods': 'OPTIONS, GET, HEAD, PUT, DELETE',
				'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With',				
			}).status(204).end();

		const gitPath = `.${ _url }`;

		if (req.method === 'PUT' && fs.existsSync(target) && fs.statSync(target).isDirectory())
			return res.status(409).send('Conflict');

		if (req.method === 'PUT' && !fs.existsSync(target))
			if (_url.split('/').reduce((coll, item) => {
				return coll.concat(`${ coll.at(-1) || '' }/${ item }`);
			}, []).filter(url => {
				const _path = path.join(_storage, url);
				return fs.existsSync(_path) && fs.statSync(_path).isFile();
			}).length)
				return res.status(409).send('Conflict');

		if (['PUT', 'DELETE'].includes(req.method) && (
			!fs.existsSync(target) && req.headers['if-match']
			|| fs.existsSync(target) && req.headers['if-match'] && req.headers['if-match'] !== await mod.etag(gitPath, isFolder)
			|| fs.existsSync(target) && req.headers['if-none-match']
			))
			return res.status(412).send('Precondition failed');

		if (['HEAD', 'GET', 'DELETE'].includes(req.method) && !fs.existsSync(target))
			return res.status(404).send('Not found');

		if (req.method === 'GET' && fs.existsSync(target) && req.headers['if-none-match'])
			if (req.headers['if-none-match'].split(',').map(e => e.trim()).includes(await mod.etag(gitPath, isFolder)))
				return res.status(304).send('Not Modified');

		if (req.method === 'PUT') {
			const folder = path.dirname(target);
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(target, JSON.stringify(req.body));

			await git.add('./*')
				.commit('sync')
				// .push('origin');
		}

		const etag = await mod.etag(gitPath, isFolder);

		if (req.method === 'DELETE') {
			fs.unlinkSync(target);

			await git.add('./*')
				.commit('sync')
				// .push('origin');

			return res.set({
				ETag: etag,
			}).status(200).send('OK');
		}

		res.set({
			'Content-Type': isFolder ? 'application/ld+json' : 'application/json',
			ETag: etag,
		}).status(200);

		if (!isFolder)
			return res.json(JSON.parse(fs.readFileSync(target, 'utf8')));

		return res.json({
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: (await git.raw('ls-tree', '--format', '%(objecttype) %(objectname) %(objectsize:padded)%x09%(path)', 'HEAD', gitPath)).trim().split('\n').map(e => {
				const [type, hash, size, path] = e.split(/\s+/);
				return {
					name: type === 'tree' ? `${ path }/` : path,
					type,
					hash,
					size: size === '-' ? null : parseInt(size),
				};
			}).reduce((coll, item) => {
				const _path = path.join(_url, item.name);
				coll[mod._relativePath(item.name, _url.slice(1))] = Object.assign(item.type === 'tree' ? {} : {
					'Content-Length': item.size,
					'Content-Type': mime.getType(_path) || 'application/json',
				}, {
					ETag: item.hash,
				});

				return coll;
			}, {}),
		});
	},

};

export default mod;
