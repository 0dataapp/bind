import { auth } from '$lib/better-auth/config';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request, url }) {
	const session = await auth.api.getSession({
		headers: request.headers,
	});

	return !session ? redirect(307, `/login?target=${ encodeURIComponent(`${ url.pathname }${ url.search }`) }`) : {
		session,
	};
}
