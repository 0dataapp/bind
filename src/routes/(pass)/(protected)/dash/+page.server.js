/** @type {import('./$types').PageServerLoad} */
export function load(event) {
	return {
		origin: event.request.headers.get('host'),
	};
}
