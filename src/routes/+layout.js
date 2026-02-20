/** @type {import('./$types').LayoutLoad} */
export function load({ route }) {
	return {
		title: 'bind',
		navigation: [
			route.id.match(/\(protected\)\/(?!dash)/) ? { path: '/dash', title: 'Dashboard' } : { path: '/', title: 'Home' },
		].concat(route.id.match('(protected)') ? { path: '/logout', title: 'Sign out' } : []),
	};
}
