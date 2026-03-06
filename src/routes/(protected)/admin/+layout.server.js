import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	return locals.authenticated?.user?.trust !== 'admin' ? error() : {};
};
