/** @type {import('./$types').LayoutLoad} */
export function load({ data }) {
	return {
		title: 'Authorize',
		redirect_uri: data?.params?.redirect_uri,
	};
}
