import depot from '$lib/depot.js';

import db from '$lib/database.js';
import { auth } from '$lib/auth/config';

const mod = {

	options: async request => {
		const subsources = await db.collection('datasource').hydrating.getItems();
		const accounts = await auth.api.listUserAccounts({ headers: request.headers });
		return Object.values(depot.options).filter(e => !(e.credentials || []).filter(e => !process.env[e]).length).filter(e => {
			if (e.meta.id === 'gitea_selfhosted') {
				if (!process.env.GITEA_ACCOUNT)
					return true;

				return accounts.map(e => e.id).includes(process.env.GITEA_ACCOUNT);
			}

			if (e.meta.id === 'local_custody' && process.env.DISABLE_CUSTODY === 'disable')
				return false;

			return true;
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

	_datasource: async id => (await db.collection('datasource').hydrating.getItems()).filter(e => e.id === id).shift(),
	_account: async id => (await db.collection('account').hydrating.getItems()).filter(e => e.id === id).shift(),

	depotURL: async depotId => {
		const source = await mod._datasource(depotId);

		if (!source)
			return;

		return source.data.cloneURL;
	},

	refs: async depotId => {
		const source = await mod._datasource(depotId);

		if (!source)
			throw new Error('datasource not found');

		const account = await mod._account(source.accountId);

		if (!account)
			throw new Error('account not found');

		return {
			source,
			account,
		};
	},

};

export default mod;
