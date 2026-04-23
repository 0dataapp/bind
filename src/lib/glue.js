import util from '$lib/util';

const mod = {

	util: {

		parseHandle (query) {
			const { resource } = Object.fromEntries(new URLSearchParams(query));

			if (!resource)
				return null;

			const account = Object.fromEntries([resource.split(':').slice(0, 2)]).acct;

			if (!account)
				return null;

			return account.split('@').shift();
		},

		parseToken: e => (!e || !e.trim()) ? null : e.split('Bearer ').pop(),

		parseScopes: e => Object.fromEntries(e.split(/\s+/).map(e => e.split(':'))),

		parsePathname: e => e.match(new RegExp('^\\/(\\w+)(\\/public)?(.*)')).slice(1),

		tidyEtag (e) {
			const string = e.trim();
			const quote = '"';
			return string.startsWith(quote) && string.endsWith(quote) ? string.slice(1, -1) : string;
		},

		sveltekit: (middleware, path) => async ({ event, resolve }) => {
			if (path && !event.url.pathname.startsWith(path))
				return resolve(event);

			const [protocol, host] = [event.url.protocol.replace(/\:$/, ''), event.url.host];
			const req = {
				url: `${ event.url.pathname }${ event.url.search }`,
				protocol,
				query: event.url.search,
				method: event.request.method,
				headers: Object.fromEntries(event.request.headers),
				get: key => ({
					host,
				}[key]),
			};

			if (path)
				req.url = req.url.replace(new RegExp(`^${ path.replaceAll('/', '\\/') }`), '');

			if (req.method === 'PUT' && !event.request.__body)
				event.request.__body = await (function () {
					if (event.request.headers.get('content-type').startsWith('application/json'))
						return event.request.json();

					if (event.request.headers.get('content-type').startsWith('text/'))
						return event.request.text();
					
					return event.request.arrayBuffer();
				})();

			if (req.method === 'PUT')
				req.body = event.request.__body;

			event.__headers = event.__headers || {};

			const res = {
				set: obj => (Object.keys(obj).forEach(key => event.__headers[key] = obj[key]), res),

				status: code => (res._status = code, res),
				json: obj => res.send(JSON.stringify(obj)),
				send: body => (res.body = body, res.end()),
				end: () => new Response(res.body, {
					status: res._status || 200,
					headers: event.__headers,
				}),
			};

			return middleware(req, res, err => {
				if (err)
					throw err;

				return resolve(event);
			});
		},

	},

	vitest: ({ middleware, url, method, headers, body }) => {
		const req = {
			url,
			method,
			headers,
		};

		for (const key in headers)
			headers[key.toLowerCase()] = headers[key];
		
		if (req.method === 'PUT')
			req.body = (function () {
				if (req.headers['content-type'].startsWith('application/json'))
					return JSON.parse(body);

				return body;
			})();

		const __headers = {};
		const res = {
			set: obj => (Object.keys(obj).forEach(key => __headers[key] = obj[key]), res),

			status: code => (res._status = code, res),
			json: obj => res.send(JSON.stringify(obj)),
			send: body => (res.body = body, res.end()),
			end: () => new Response(res.body, {
				status: res._status || 200,
				headers: __headers,
			}),
		};

		return middleware(req, res, err => {
			if (err)
				throw err;

			return res.end();
		});
	},

	webfinger: ({ storagePath, authPath }) => async (req, res, next) => {
		if (!req.url.toLowerCase().match('/.well-known/webfinger'))
			return next();

		res.set({
			'Access-Control-Allow-Origin': '*',
		});

		const base = `${ req.protocol }://${ req.get('host') }`;
		
		let handle = mod.util.parseHandle(req.query);

		if (!handle)
			return next();

		return res.json({
			links: [{
				rel: 'http://tools.ietf.org/id/draft-dejong-remotestorage',
				href: `${ base }${ await storagePath(handle) }`,
				properties: {
					'http://remotestorage.io/spec/version': `draft-dejong-remotestorage-${ mod.remotestorage_spec_version }`,
					'http://tools.ietf.org/html/rfc6749#section-4.2': `${ base }${ authPath }`,
				},
			}],
		});
	},

	remotestorage_spec_version: 13,
	remotestorage: ({ getFS, getScope }) => async (req, res, next) => {
		// console.info(req.method, req.url);
		res.set({
			'Access-Control-Allow-Origin': req.headers['origin'] || '*',
			'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With, Content-Range',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag',
			'Cache-Control': 'no-cache',
		});

		if (req.method === 'OPTIONS')
			return res.set({
				'Access-Control-Allow-Methods': 'OPTIONS, GET, HEAD, PUT, DELETE',
			}).status(204).end();

		const [handle, isPublicFolder, relative] = mod.util.parsePathname(req.url);
		const token = mod.util.parseToken(req.headers.authorization);
		const fs = await getFS({
			handle,
			token,
		});

		if (!isPublicFolder && !token)
			return res.status(401).send('missing token');

		const isFolderRequest = req.url.endsWith('/');

		const _scope = await getScope(handle, token);

		if (!_scope && isPublicFolder && isFolderRequest)
			return res.status(401).end();

		if (!_scope && !isPublicFolder)
			return res.status(401).send('missing scope');

		const intent = relative === '/' ? '/' : relative.match(/^\/([^\/]+)/).pop();
		const available = !_scope ? {
			// if isPublicFolder, we may have no token but still scope available
		} : mod.util.parseScopes(_scope);

		if (!isPublicFolder && _scope && !Object.keys(available).includes(intent) && !Object.keys(available).includes('*'))
			return res.status(401).send('invalid _scope');

		if (['PUT', 'DELETE'].includes(req.method) && (!_scope || !(available[intent] || available['*']).includes('w')))
			return res.status(401).send('invalid access');

		if (req.method === 'PUT' && req.headers['content-range'])
			return res.status(400).end();

		const target = `${ isPublicFolder ? '/public' : ''}${ relative }`;
		const _meta = await fs.meta({
			handle,
			target,
			isFolderRequest,
		});
		const meta = _meta || {
			ETag: isFolderRequest ? 'empty' : undefined,
		};
		const exists = !!_meta;
		
		// const _isFolder = exists && (Object.keys(_meta).length === 1) && _meta.ETag;
		// if (req.method === 'PUT' && _isFolder)
		// 	return res.status(409).end();
		
		const _breadcrumbs = ['/', ...util.breadcrumbs(target.split('/').slice(1, isFolderRequest ? -1 : undefined))];

		// if (req.method === 'PUT' && await Promise.all(_breadcrumbs.slice(1).map(async target => {
		// 	const exists = await fs.exists({
		// 		handle,
		// 		target,
		// 	});
		// 	return {
		// 		target,
		// 		exists,
		// 		isFolder: exists && await fs.isFolder({
		// 			handle,
		// 			target,
		// 		}),
		// 	};
		// })).then(e => e.filter(e => e.exists && (`/${ e.target }` === target ? e.isFolder : !e.isFolder)).length))
		// 	return res.status(409).end();

		if (['PUT', 'DELETE'].includes(req.method) && (
			!exists && req.headers['if-match']
			|| exists && req.headers['if-match'] && mod.util.tidyEtag(req.headers['if-match']) !== meta.ETag
			|| exists && req.headers['if-none-match']
			))
			return res.status(412).end();

		const listResponse = {
			'@context': 'http://remotestorage.io/spec/folder-description',
			items: {},
		};

		if (isFolderRequest)
			meta['Content-Type'] = 'application/ld+json';

		if (['HEAD', 'GET', 'DELETE'].includes(req.method) && !exists)
			return isFolderRequest ? res.set(meta).status(200).json(listResponse) : res.status(404).send('Not found');

		if (req.method === 'GET' && exists && req.headers['if-none-match'] && req.headers['if-none-match'].split(',').map(mod.util.tidyEtag).includes(meta.ETag))
			return res.status(304).end();

		const breadcrumbs = _breadcrumbs.slice(0, -1);

		if (req.method === 'PUT')
			await fs.put({
				handle,
				target,
				data: req.body,
				breadcrumbs,
				meta: Object.assign(meta, {
					'Content-Type': req.headers['content-type'],
				}),
			});

		meta['ETag'] = `"${ meta['ETag'] }"`;

		res
			.set(meta)
			.status(200);

		if (req.method === 'PUT')
			return res.set({
				'Content-Length': 0,
			}).end();

		if (req.method === 'DELETE')
			await fs.remove({
				handle,
				target,
				breadcrumbs,
				meta,
			});
		
		if (['HEAD', 'DELETE'].includes(req.method))
			return res.end();

		if (isFolderRequest)
			return res.json(Object.assign(listResponse, {
				items: await fs.list({
					handle,
					target,
				}),
			}));

		return res.send(await fs.get({
			handle,
			target,
			contentType: meta['Content-Type'],
		}));
	},

};

export default mod;
