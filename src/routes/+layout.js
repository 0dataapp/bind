/** @type {import('./$types').LayoutLoad} */
export function load({ route }) {
	return {
		title: 'Bind',
		navigation: [].concat(
			route.id.match(/\(protected\)\/(?!dash)/)
			? { path: '/dash', title: 'Dashboard' }
			: []
		).concat(
			route.id.match('(protected)')
			? { path: '/logout', title: 'Sign out' }
			: []
			),
	};
}
