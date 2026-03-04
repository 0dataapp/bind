import local_custody from './depot/local_custody.js';
import github from './depot/github.js';
import gitea_selfhosted from './depot/gitea_selfhosted.js';

const asMap = {
	local_custody,
	github,
	gitea_selfhosted,
};

import db from '$lib/database.js';
const _db = db.collection('account_subsource');

const mod = {

	_maxBytes: 100000,
	maxSize: () => `${ mod._maxBytes / 1000 }MB`,

	options: {

		asMap,
		asList: Object.entries(asMap).map(([slug, e]) => ({ slug, name: e.name })),

	},

	endpoint: provider => ({

		async repos (params) {
			const _provider = asMap[provider].repos;
			const config = _provider.config(params);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json()).filter(e => e.size < mod._maxBytes);
		},

		invalidate (params) {
		  const config = asMap[provider].invalidate.config(params);
		  
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
