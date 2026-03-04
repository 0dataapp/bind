import { auth } from '$lib/auth/config';
import db from '$lib/database.js';
import depot from '$lib/depot.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const accounts = await Promise.all((await auth.api.listUserAccounts({
		headers: request.headers,
	})).filter(e => e.providerId !== 'credential').map(async e => {

		if (e.providerId === 'github')
			e._sources = (await db.collection('account_source').hydrating.getItems()).filter(source => source.accountId === e.id);
		
		return e;
	}))
  return {
  	title: 'Data sources',
		available: depot.options.asList.filter(e => !accounts.map(e => e.providerId).includes(e.slug) && e.slug !== 'local_custody'),
		linked: accounts.map(account => Object.assign(depot.options.asList.filter(e => account.providerId === e.slug).shift(), {
			account,
		})),
	};
}
