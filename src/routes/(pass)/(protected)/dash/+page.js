/** @type {import('./$types').LayoutLoad} */
export function load({ data }) {
	return {
		title: 'Dashboard',
		origin: (data || {}).origin,
	};
}
