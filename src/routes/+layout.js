import props from './props.js';

/** @type {import('./$types').LayoutLoad} */
export function load({ route }) {
	return {
		...props,
		navigation: [].concat(
			route.id.match(/\(protected\)\/(?!dash)/)
			? { path: '/dash', title: 'Dashboard' }
			: []
		).concat(
			route.id.match('(protected)')
			? [].concat(
				route.id === '/(protected)/dash'
					? { path: '/account', title: 'Account' }
					: []
					).concat({ path: '/logout', title: 'Sign out' })
			: []
			),
	};
};
