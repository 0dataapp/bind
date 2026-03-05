import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	return !locals.authenticated ? redirect(307, `/login?target=${ encodeURIComponent(`${ url.pathname }${ url.search }`) }`) : {
		authenticated: locals.authenticated,
	};
}
