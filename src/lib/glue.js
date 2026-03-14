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

	cors: () => (req, res, next) => {
		res.set({
			'Access-Control-Allow-Origin': req.headers['origin'] || '*',
			'Access-Control-Allow-Headers': 'Authorization, Content-Length, Content-Type, If-Match, If-None-Match, Origin, X-Requested-With, Content-Range',
			'Access-Control-Allow-Credentials': 'true',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Type, ETag',
			'Cache-control': 'no-cache',
		});

		if (req.method === 'OPTIONS')
			return res.set({
				'Access-Control-Allow-Methods': 'OPTIONS, GET, HEAD, PUT, DELETE',
			}).status(204).end();

		return next();
	},

	webfinger: ({ storagePath, authPath }) => async (req, res, next) => {
		if (!req.url.toLowerCase().match('/.well-known/webfinger'))
			return next();

		const base = `${ req.protocol }://${ req.get('host') }`;
		
		let handle = mod.util.parseHandle(req.query);

		if (!handle)
			return next();

		return res.json({
			links: [{
				rel: 'http://tools.ietf.org/id/draft-dejong-remotestorage',
				href: `${ base }${ await storagePath(handle) }`,
				properties: {
					'http://remotestorage.io/spec/version': 'draft-dejong-remotestorage-11',
					'http://tools.ietf.org/html/rfc6749#section-4.2': `${ base }${ authPath }`,
				},
			}],
		});
	},

	remotestorage: ({ hold, getScope }) => async (req, res, next) => {
		// console.info(req.method, req.url);
		const [handle, isPublicFolder, target] = mod.util.parsePathname(req.url);
		const token = mod.util.parseToken(req.headers.authorization);

		if (!isPublicFolder && !token)
			return res.status(401).send('missing token');

		const isFolderRequest = req.url.endsWith('/');

		const scope = await getScope(handle, token);

		if (!scope && isPublicFolder && isFolderRequest)
			return res.status(401).end();

		if (!scope && !isPublicFolder)
			return res.status(401).send('missing scope');

		const _scope = target === '/' ? '/' : target.match(/^\/([^\/]+)/).pop();

		const scopes = !scope ? {
			// if isPublicFolder, we may not have a token
		} : mod.util.parseScopes(scope);

		if (!isPublicFolder && scope && !Object.keys(scopes).includes(_scope) && !Object.keys(scopes).includes('*'))
			return res.status(401).send('invalid scope');

		if (['PUT', 'DELETE'].includes(req.method) && (!scope || !(scopes[_scope] || scopes['*']).includes('w')))
			return res.status(401).send('invalid access');

		if (req.method === 'PUT' && req.headers['content-range'])
			return res.status(400).end();

		const __url = `${ isPublicFolder ? '/public' : ''}${ target }`;
		const targetExists = await hold.exists({
			handle,
			target: __url,
		});

		if (req.method === 'PUT' && targetExists && (await hold.isFolder({
			handle,
			target: __url,
		})))
			return res.status(409).end();

		const ancestors = __url.split('/').slice(1, -1).reduce((coll, item) => {
			if (coll.at(-1))
				item = `${ coll.at(-1) || '' }/${ item}`;
			return coll.concat(`${ item }/`);
		}, []);

		if (req.method === 'PUT' && !targetExists)
			if ((await Promise.all(ancestors.slice(1).map(async e => await hold.exists({
				handle,
				target: e,
			}) && (await hold.isFolder({
				handle,
				target: e,
			}))))).filter(e => !!e).length)
				return res.status(409).end();

		const meta = await hold.meta({
			handle,
			target: __url,
		});

		if (['PUT', 'DELETE'].includes(req.method) && (
			!targetExists && req.headers['if-match']
			|| targetExists && req.headers['if-match'] && mod.util.tidyEtag(req.headers['if-match']) !== meta.ETag
			|| targetExists && req.headers['if-none-match']
			))
			return res.status(412).end();

		if (['HEAD', 'GET', 'DELETE'].includes(req.method) && !targetExists)
			return isFolderRequest ? res.status(200).json({
			'@context': 'http://remotestorage.io/spec/folder-description',
				items: {},
			}) : res.status(404).send('Not found');

		if (req.method === 'GET' && targetExists && req.headers['if-none-match'] && req.headers['if-none-match'].split(',').map(mod.util.tidyEtag).includes(meta.ETag))
			return res.status(304).end();

		if (req.method === 'PUT')
			await hold.put({
				handle,
				target: __url,
				data: req.body,
				ancestors,
				meta: Object.assign(meta, {
					'Content-Type': req.headers['content-type'],
				}),
			});

		meta['ETag'] = `"${ meta['ETag'] }"`;

		if (req.method === 'DELETE') {
			await hold.delete({
				handle,
				target: __url,
				ancestors,
			});
			return res.set({
				ETag: meta['ETag'],
			}).status(200).end();
		} 

		if (isFolderRequest)
			meta['Content-Type'] = 'application/ld+json';
		
		res
			.set(meta)
			.status(200);

		if (req.method === 'HEAD')
			return res.end();

		if (isFolderRequest)
			return res.json({
				'@context': 'http://remotestorage.io/spec/folder-description',
				items: await hold.list({
					handle,
					target: __url,
				}),
			});

		return res.send(await hold.get({
			handle,
			target: __url,
			contentType: meta['Content-Type'],
		}));
	},

};

export default mod;
