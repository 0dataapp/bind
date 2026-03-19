import depot from '$lib/depot.js';
import auth from '$lib/depot/auth.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, url }) {
	const options2 = (await auth.options(request)).filter(e => e.id !== 'local_custody');

	const mockAllAvailable = import.meta.env.MODE === 'testing' && url.searchParams.get('test') === 'mockAllAvailable';
	const mockAllLinked = import.meta.env.MODE === 'testing' && url.searchParams.get('test') === 'mockAllLinked';
	const _options = Object.values(depot.options).map(e => e.meta).filter(e => e.id !== 'local_custody');
	return {
  	title: 'Data sources',
		available: mockAllAvailable ? _options : options2.filter(e => !e.account),
		linked: mockAllLinked ? _options : options2.filter(e => e.account),
	};
};
