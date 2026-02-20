/** @type {import('./$types').PageServerLoad} */
export function load({ request }) {
	return {
		origin: request.headers.get('host'),
	};
}
