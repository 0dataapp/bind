import { env } from '$env/dynamic/private';

/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		title: 'Sign in',
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	};
}
