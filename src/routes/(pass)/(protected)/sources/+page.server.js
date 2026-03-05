import { auth } from '$lib/auth/config';
import db from '$lib/database.js';
import depot from '$lib/depot.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const accounts = await Promise.all((await auth.api.listUserAccounts({
		headers: request.headers,
	})).filter(e => e.providerId !== 'credential').map(async e => {
		const meta = depot.options.asMap[e.providerId].meta;

		if (meta.hasSubsources)
			e._subsources = (await db.collection('account_subsource').hydrating.getItems()).filter(source => source.accountId === e.id);
		
		return e;
	}));
	const options = Object.values(depot.options.asMap).map(e => e.meta);
  return {
  	title: 'Data sources',
		available: options.filter(e => e.id !== 'local_custody' && !accounts.map(e => e.providerId).includes(e.id)),
		linked: accounts.map(account => Object.assign(options.filter(e => account.providerId === e.id).shift(), {
			account,
		})),
	};
};
