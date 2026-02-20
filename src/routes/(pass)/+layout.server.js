import { auth } from '$lib/better-auth/config';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request }) {
	return {
		session: await auth.api.getSession({
			headers: request.headers,
		}),
	};
}
