const env = {}
import { config } from 'dotenv'; // sveltekit $env not available in playwright
config({ processEnv: env });

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	return (await parent()).session ? redirect(307, '/dash') : {
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	};
}
