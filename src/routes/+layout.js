export const trailingSlash = 'always';

/** @type {import('./$types').LayoutLoad} */
export function load() {
	return {
		title: 'auth-proof',
		navigation: [
			{ path: '/', title: 'home' },
		],
	};
}
