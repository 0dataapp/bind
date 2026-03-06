import { error } from '@sveltejs/kit';
import { auth } from '$lib/auth/config';

/** @type {import('./$types').PageLoad} */
export async function load({ request }) {
	const { users, error } = await auth.api.listUsers({
	  query: {
	    limit: 0,
	  },
	  headers: request.headers,
	});
	return error ? error(500, {
		message: error.message,
	}) : {
		title: 'Admin',
		users,
	};
};
