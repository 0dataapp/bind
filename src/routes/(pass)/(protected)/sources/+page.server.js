import { auth } from '$lib/better-auth/config';
import db from '$lib/database/main.js';
const _db = db.collection('account_source');

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const accounts = await auth.api.listUserAccounts({
		headers: request.headers,
	});
  return {
  	title: 'Data sources',
		accounts: await Promise.all(accounts.filter(e => e.providerId !== 'credential').map(async e => {

			if (e.providerId === 'github')
				e._sources = (await _db.getItems()).filter(source => source.accountId === e.id).length;
			
			return e;
		})),
	};
}
