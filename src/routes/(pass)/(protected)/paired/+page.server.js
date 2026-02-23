/** @type {import('./$types').PageServerLoad} */
export async function load({ parent }) {
	return {
		title: 'Connected apps',
		connections: (await parent()).connections,
	};
}
