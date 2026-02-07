/** @type {import('./$types').PageServerLoad} */
export function load(event) {
	return {
		user: event.locals.user,
	};
}
