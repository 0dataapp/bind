import depot from '$lib/depot.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
	const options = (await depot.options2(request)).filter(e => e.id !== 'local_custody');
	return {
  	title: 'Data sources',
		available: options.filter(e => !e.account),
		linked: options.filter(e => e.account),
	};
};
