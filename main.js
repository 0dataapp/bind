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

	_resolvePath: (handle, url) => path.join(__dirname, '__storage', handle, url),

	_readJson (path) {
    try {
      const content = fs.readFileSync(path);
      return content ? JSON.parse(content) : null;
    } catch (e) {
      if (e.code !== 'ENOENT')
      	console.error('reading JSON failed:', e);

      return null;
    }
  },

  _access (handle, token) {
	  const user = mod._readJson(mod._resolvePath(handle, 'auth.json'));
	  if (!user)
	  	return {};

	  const data = user.sessions;
	  if (!data || !data[token])
	  	return {};

	  const permissions = data[token].permissions;
	  if (!permissions)
	  	return {};
	  
	  const output = {};

	  for (const category in permissions) {
	    output[category] = Object.keys(permissions[category]).sort();
	  }

	  return output;
	},

	async handle (req, res, next) {
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

		const permissions = mod._access(handle, token);

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

		const target = path.join(_storage, _url);
		
		if (req.method === 'PUT' && fs.existsSync(target) && fs.statSync(target).isDirectory())
			return res.status(409).end();

		if (req.method === 'PUT' && !fs.existsSync(target))
			if (_url.split('/').reduce((coll, item) => {
				return coll.concat(`${ coll.at(-1) || '' }/${ item }`);
			}, []).filter(url => {
				const _path = path.join(_storage, url);
				return fs.existsSync(_path) && fs.statSync(_path).isFile();
			}).length)
				return res.status(409).end();

		const isFolder = req.url.endsWith('/');
		const gitPath = `.${ _url }`;

		if (['PUT', 'DELETE'].includes(req.method) && (
			!fs.existsSync(target) && req.headers['if-match']
			|| fs.existsSync(target) && req.headers['if-match'] && req.headers['if-match'] !== await mod.etag(gitPath, isFolder)
			|| fs.existsSync(target) && req.headers['if-none-match']
			))
			return res.status(412).end();

		if (['HEAD', 'GET', 'DELETE'].includes(req.method) && !fs.existsSync(target))
			return res.status(404).send('Not found');

		if (req.method === 'GET' && fs.existsSync(target) && req.headers['if-none-match'])
			if (req.headers['if-none-match'].split(',').map(e => e.trim()).includes(await mod.etag(gitPath, isFolder)))
				return res.status(304).end();

		if (req.method === 'PUT') {
			const folder = path.dirname(target);
			fs.mkdirSync(folder, { recursive: true });
			fs.writeFileSync(target, req.headers['content-type'] === 'application/json' ? JSON.stringify(req.body) : req.body);

			await git.add('./*')
				.commit('sync')
				// .push('origin');
		}

		const etag = await mod.etag(gitPath, isFolder);
		const data = isFolder ? null : fs.readFileSync(target);

		const meta = {
			'Content-Type': isFolder ? 'application/ld+json' : await mod.guessMimeType(data),
			ETag: etag,
		};

		if (!isFolder)
			meta['Content-Length'] = fs.statSync(target).size;

		res.set(meta).status(200);

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
			return res.send(meta['Content-Type'] === 'application/json' ? fs.readFileSync(target, 'utf8') : data);

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
