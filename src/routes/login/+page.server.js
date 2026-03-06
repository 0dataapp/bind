import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import props from './props.js';

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }) {
	return locals.authenticated ? redirect(307, '/dash') : {
		...props,
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	};
};
