import { error } from '@sveltejs/kit';
import { auth } from '$lib/auth/config';

/** @type {import('./$types').PageLoad} */
export async function load({ request, url }) {
	const { users, error } = import.meta.env.MODE === 'testing' && url.searchParams.get('test') === 'mockAdmin' ? {
		users: [],
	} : await auth.api.listUsers({
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
