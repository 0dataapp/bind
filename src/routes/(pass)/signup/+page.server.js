import { env } from '$env/dynamic/private';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	return (await parent()).session ? redirect(307, '/dash') : (env.DISABLE_SIGNUPS ?  redirect(307, '/login') : {});
}
