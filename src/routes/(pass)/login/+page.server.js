import { env } from '$env/dynamic/private';

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	return (await parent()).session ? redirect(307, '/dash') : {
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	};
}
