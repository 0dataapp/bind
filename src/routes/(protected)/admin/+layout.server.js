import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	return locals.authenticated?.user?.role !== 'admin' ? error(404, {
		message: 'Not found',
	}) : {};
};
