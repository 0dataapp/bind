const env = {}
import { config } from 'dotenv'; // sveltekit $env not available in playwright
config({ processEnv: env });

/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		title: 'Sign in',
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	};
}
