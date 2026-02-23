import oauth from '$lib/oauth-implicit/main.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	const session = (await parent()).session;
	return {
		connections: oauth.authorizations(session.user.id),
	};
}
