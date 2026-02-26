import { auth } from '$lib/better-auth/config';
import { redirect } from '@sveltejs/kit';

import _abstract from '$lib/provider/_abstract.js';
import util from '$lib/util.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, params }) {
  const accounts = (await auth.api.listUserAccounts({ headers: request.headers })).filter(e => e.providerId === params.configure_id);

  return !accounts.length ? redirect(307, '/sources') : {
		title: `Configure ${ _abstract._map[params.configure_id].name }`,
		groups: (await Promise.all(accounts.map(async e => {
			const { accessToken } = await auth.api.getAccessToken({
				body: Object.assign(structuredClone(e), { accountId: e.id }),
				headers: request.headers,
			});
			const repos = await _abstract.generate(e.providerId).repos(accessToken);

			const order = ['Private', 'Public'];
			
			const list = util.group.asArray(repos, e => order[+!e.isPrivate]);

			return list.sort(util.sort.conform(order, e => e.key)).map(({ key, values }) => ({
				account: e,
				label: `${ _abstract._map[e.providerId].name } (${ key })`,
				options: values.sort(util.sort.asc(e => e.name)),
			}));
		}))).flat(),
	};
};
