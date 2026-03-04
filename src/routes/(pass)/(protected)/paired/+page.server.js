import oauth from '$lib/oauth-implicit.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	return {
		title: 'Connected apps',
		connections: await oauth.authorizations(locals.authenticated.user.username),
	};
};
