import { auth } from '$lib/better-auth/config';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ request }) {
	return await auth.api.getSession({
		headers: request.headers,
	}) ? redirect(307, '/dash') : {};
}
