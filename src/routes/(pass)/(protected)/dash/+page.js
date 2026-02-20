/** @type {import('./$types').PageLoad} */
export function load({ data }) {
	return {
		title: 'Dashboard',
		origin: (data || {}).origin,
	};
}
