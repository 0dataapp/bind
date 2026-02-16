import { db } from '$lib/db.svelte';

import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').RequestHandler} */
export function GET(event) {
	event.locals.user = null;
	event.cookies.delete('sessionid', { path: '/' });

	return redirect(301, '/');
};
