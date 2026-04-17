import depot from '$lib/depot.js';

import db from '$lib/database.js';
import { auth } from '$lib/auth/config';

const mod = {

	options: async request => {
		const subsources = await db.collection('datasource').hydrating.getItems();
		const accounts = await auth.api.listUserAccounts({ headers: request.headers });
		return Object.values(depot.options).filter(e => !(e.credentials || []).filter(e => !process.env[e]).length).filter(e => {
			if (e.meta.id !== 'gitea_selfhosted')
				return true;

			if (!process.env.GITEA_ACCOUNT)
				return true;

			return accounts.map(e => e.id).includes(process.env.GITEA_ACCOUNT);
		}).map(e => {
			Object.assign(e = structuredClone(e.meta), {
				optionId: e.id,
				account: accounts.filter(account => account.providerId === e.id).shift(),
			});

			if (e.hasSubsources && e.account)
				e._subsources = subsources.filter(source => source.accountId === e.account.id).map(e => Object.assign(e, { optionId: e.id }));

			return e;
		});
	},

	_source: async id => (await db.collection('datasource').hydrating.getItems()).filter(e => e.id === id).shift(),

	depotURL: async id => {
		const source = await mod._source(id);

		if (!source)
			return;

		return source.data.cloneURL;
	},

};

export default mod;
