import util from '$lib/util.js';
import oauth from '$lib/oauth-implicit.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ params, locals }) {
	const client_id = util.hex.decode(params.client_hex);

	const connections = await oauth.authorizations(locals.authenticated.user.username);

	if (!connections.length)
		return redirect(307, '/connected');

	return {
		title: `Connection for ${ util.humanLink(client_id) }`,
		connections: connections.filter(e => e.data.client_id === client_id),
	};
};

import { auth } from '$lib/auth/config';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, params }) => {
		await oauth.revokeClient((await auth.api.getSession({
			headers: request.headers,
		})).user.username, util.hex.decode(params.client_hex));

		return redirect(303, '/connected');
	},

};
