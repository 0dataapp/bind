import { db } from '$lib/db.svelte';

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ cookies }) {
	const user = await db.getUser(db.getSession(cookies.get('sessionid')));
	return !user ? redirect(307, '/login') : {
		user,
	};
}
