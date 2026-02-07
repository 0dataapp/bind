import { db } from '$lib/db.svelte';

import { redirect } from '@sveltejs/kit';

/** @type {import('@sveltejs/kit').Handle} */
export async function handle({ event, resolve }) {
	event.locals.user = await db.getUser(db.getSession(event.cookies.get('sessionid')));
	return resolve(event);
}
