import fs from 'fs';
import path from 'path';

const prefix = 'storage';

const mod = {

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

		const meta = await adapter.meta(handle, _url);

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

		if (req.method === 'PUT')
			await adapter.put(handle, _url, req.body, _folders, Object.assign(meta, {
				'Content-Type': req.headers['content-type'],
			}));

		const isFolderRequest = req.url.endsWith('/');

		if (isFolderRequest)
			meta['Content-Type'] = 'application/ld+json';
		
		res.set(meta).status(200);

		if (req.method === 'HEAD')
			return res.end();

		if (req.method === 'DELETE') {
			fs.unlinkSync(target);
			
			await adapter.delete(target, _folders);

			return res.end();
		}

		return isFolderRequest ? res.json({
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: await adapter.folderItems(handle, _url),
		}) : res.send(fs.readFileSync(target, meta['Content-Type'] === 'application/json' ? 'utf8' : undefined));
	},

};

export default mod;
