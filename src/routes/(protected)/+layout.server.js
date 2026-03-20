import { redirect } from '@sveltejs/kit';
import util from '$lib/util.js';

/** @type {import('./$types').LayoutServerLoad} */
export async function load({ locals, url, route }) {
	const { authenticated } = locals;

	if (!authenticated)
		return redirect(307, `/login?target=${ encodeURIComponent(`${ url.pathname }${ url.search }`) }`);

	const navigation = [];

	if (route?.id.match(/\(protected\)\/(?!dash)/))
		navigation.push({ path: '/dash', title: 'Dashboard' });
	
	if (route?.id === '/(protected)/dash')
		navigation.push({ path: '/account', title: 'Account' });
	
	if (authenticated.user.role === 'admin')
		navigation.push({ path: '/admin', title: 'Admin' });
	
	navigation.push({ path: '/logout', title: 'Sign out' });

	return {
		username: authenticated.user.username,
		navigation,
		classes: !route.id ? '' : util.breadcrumbs(route.id.split('/').filter(e => !!e && !e.includes('(')).map(util.slugify), '-').join(' '),
	};
};

