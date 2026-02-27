/** @type {import('./$types').PageLoad} */
export async function load({ data }) {
	return Object.assign(data, {
		title: 'Data sources',
	});
};
