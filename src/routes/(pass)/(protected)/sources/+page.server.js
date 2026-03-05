import { auth } from '$lib/auth/config';
import depot from '$lib/depot.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const options = await depot.options2(request);
	const accounts = await auth.api.listUserAccounts({ headers: request.headers });
  return {
  	title: 'Data sources',
		available: options.filter(e => e.providerId !== 'local_custody' && !accounts.map(e => e.providerId).includes(e.providerId)),
		linked: accounts.filter(e => e.providerId !== 'credential').map(account => Object.assign(options.filter(e => e.providerId === account.providerId).shift(), {
			account,
		})),
	};
};
