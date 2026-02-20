/** @type {import('./$types').LayoutLoad} */
export function load({ route }) {
	return {
		title: 'bind',
		navigation: [
			{ path: '/', title: 'home' },
		].concat(route.id.match('(protected)') ? { path: '/logout', title: 'Sign out' } : []),
	};
}
