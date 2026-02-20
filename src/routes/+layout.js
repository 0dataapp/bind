/** @type {import('./$types').LayoutLoad} */
export function load({ route }) {
	return {
		title: 'bind',
		navigation: [
			{ path: '/', title: 'Home' },
		].concat(route.id.match('(protected)') ? { path: '/logout', title: 'Sign out' } : []),
	};
}
