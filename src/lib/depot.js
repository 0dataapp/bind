import local_custody from './depot/local_custody.js';
import github from './depot/github.js';
import gitea_selfhosted from './depot/gitea_selfhosted.js';

import db from '$lib/database.js';
const _db = db.collection('account_subsource');
import { auth } from '$lib/auth/config';

const mod = {

	_maxBytes: 100000,
	maxSize: () => `${ mod._maxBytes / 1000 }MB`,

	options: {
		github,
		gitea_selfhosted,
		local_custody,
	},

	options2: async request => {
		const subsources = await _db.hydrating.getItems();
		const accounts = await auth.api.listUserAccounts({ headers: request.headers });
		return Object.values(mod.options).filter(e => !(e.credentials || []).filter(e => !process.env[e]).length).map(e => {
			Object.assign(e = structuredClone(e.meta), {
				optionId: e.id,
				account: accounts.filter(account => account.providerId === e.id).shift(),
			});

			if (e.hasSubsources && e.account)
				e._subsources = subsources.filter(source => source.accountId === e.account.id).map(e => Object.assign(e, { optionId: e.id }));

			return e;
		});
	},

	endpoint: provider => ({

		async repos (params) {
			const _provider = mod.options[provider].repos;
			const config = _provider.config(params);

			config.headers = Object.assign(config.headers || {}, {
				'Content-Type': 'application/json',
			});

			const res = await fetch(config.url, config);

			return _provider.data(await res.json()).filter(e => e.size < mod._maxBytes);
		},

		invalidate (params) {
			if (!mod.options[provider].invalidate)
				return;
			
		  const config = mod.options[provider].invalidate.config(params);
		  
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
