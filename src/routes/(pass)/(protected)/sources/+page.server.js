import { auth } from '$lib/better-auth/config';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
  return {
		accounts: await auth.api.listUserAccounts({ headers: request.headers }),
	};
}
