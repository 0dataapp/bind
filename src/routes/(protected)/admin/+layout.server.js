import { error } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url }) {
	if (import.meta.env.MODE === 'testing' && url.searchParams.get('test') === 'mockAdmin')
		return {};

	return locals.authenticated?.user?.role !== 'admin' ? error(404, {
		message: 'Not found',
	}) : {};
};
