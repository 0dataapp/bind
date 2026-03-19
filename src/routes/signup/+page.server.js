import db from '$lib/database.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	return locals.authenticated ? redirect(307, '/dash') : (await db.collection('admin_settings').hydrating.getItems().then(e => e.filter(e => e.key === 'disable_signups').map(e => e.value).shift()) ? redirect(307, '/login') : {});
};
