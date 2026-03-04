import github from './depot/github.js';

const asMap = {
	local_custody: 'this server',
	github: 'GitHub',
};

import db from '$lib/database.js';
const _db = db.collection('account_source');

const mod = {

	_map: {
		github,
	},

	_maxBytes: 100000,
	maxSize: () => `${ mod._maxBytes / 1000 }MB`,

	options: {

		asMap,
		asList: Object.entries(asMap).map(([slug, name]) => ({ slug, name })),

	},

	endpoint: provider => ({

		async repos (token) {
			const _provider = mod._map[provider].repos;
			const config = _provider.config(token);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json()).filter(e => e.size < mod._maxBytes);
		},

		invalidate (params) {
		  const config = mod._map[provider].invalidate.config(params);
		  
		  config.headers = Object.assign(config.headers || {}, {
		  	'Content-Type': 'application/json',
		  });

		  return fetch(config.url, config);
		},

	}),

	source: async id => (await _db.hydrating.getItems()).filter(e => e.id === id).shift(),

	depotURL: async id => {
		const source = await mod.source(id);

		if (!source)
			return;

		return source.data.cloneURL;
	},

};

export default mod;
