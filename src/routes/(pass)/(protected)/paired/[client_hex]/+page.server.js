import util from '$lib/util.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent, params }) {
	const client_id = util.hex.decode(params.client_hex);

	const connections = (await parent()).connections;

	if (!connections.length)
		return redirect(307, '/paired');

	return {
		title: `Connection for ${ client_id }`,
		connections: connections.filter(e => e.data.client_id === client_id),
	};
};

import { auth } from '$lib/better-auth/config';
import oauth from '$lib/oauth-implicit/main.js';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, parent, params }) => {
		await oauth.revokeClient((await auth.api.getSession({
			headers: request.headers,
		})).user.id, util.hex.decode(params.client_hex));

		return redirect(303, '/paired');
	},

};
