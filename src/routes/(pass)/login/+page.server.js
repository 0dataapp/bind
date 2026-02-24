import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import data from './data.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	return (await parent()).session ? redirect(307, '/dash') : Object.assign(data, {
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	});
}
