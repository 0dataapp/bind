import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import data from './data.js';

/** @type {import('./$types').PageServerLoad} */
export function load({ locals }) {
	return locals.authenticated ? redirect(307, '/dash') : Object.assign(data, {
		DISABLE_SIGNUPS: env.DISABLE_SIGNUPS,
	});
};
