import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url, route }) {
	return !locals.authenticated ? redirect(307, `/login?target=${ encodeURIComponent(`${ url.pathname }${ url.search }`) }`) : {
		username: locals.authenticated.user.username,
		navigation: [].concat(
			route?.id.match(/\(protected\)\/(?!dash)/)
			? { path: '/dash', title: 'Dashboard' }
			: []
		).concat(
			route?.id.match('(protected)')
			? [].concat(
				route?.id === '/(protected)/dash'
					? { path: '/account', title: 'Account' }
					: []
					).concat({ path: '/logout', title: 'Sign out' })
			: []
			),
	};
};

