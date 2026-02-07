import { db } from '$lib/db.svelte';

import { fail, redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ cookies, request, url }) => {
		const data = await request.formData();
		const handle = data.get('handle');
		const password = data.get('password');

		const user = await db.getUser(handle);
		
		if (!user || user.hash !== await db.hash(password))
			return new Promise((res, rej) => setTimeout(res, 3000 + 1000 * Math.random())).then(() => redirect(301, '/'));

		cookies.set('sessionid', await db.createSession(user), { path: '/' });

			// redirect(303, url.searchParams.get('redirectTo'));
		return redirect(303, '/dash');
	},

};