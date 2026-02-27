import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }) {
	return locals.authenticated ? redirect(307, '/dash') : (env.DISABLE_SIGNUPS ?  redirect(307, '/login') : {});
}
