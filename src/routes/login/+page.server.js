import { redirect } from '@sveltejs/kit';
import props from './props.js';
import db from '$lib/database.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	return locals.authenticated ? redirect(307, '/dash') : {
		...props,
		disable_signups: await db.collection('admin_settings').hydrating.getItems().then(e => e.filter(e => e.key === 'disable_signups').map(e => e.value).shift()),
	};
};
