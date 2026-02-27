import { auth } from '$lib/better-auth/config';
import db from '$lib/database/main.js';
import util from '$lib/util.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const accounts = await auth.api.listUserAccounts({
		headers: request.headers,
	});
  return {
  	title: 'Data sources',
		accounts: await Promise.all(accounts.filter(e => e.providerId !== 'credential').map(async e => {

			if (e.providerId === 'github')
				e._sources = (await db.collection('account_source').getItems()).filter(source => source.accountId === e.id).map(util.hydrate);
			
			return e;
		})),
	};
}
