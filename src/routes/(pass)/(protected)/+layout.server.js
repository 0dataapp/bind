import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ parent, url }) {
	const _parent = await parent();
	const session = _parent.session;

	return !session ? redirect(307, `/login?target=${ encodeURIComponent(`${ url.pathname }${ url.search }`) }`) : _parent;
}
