import { auth } from '$lib/better-auth/config';
import _abstract from '$lib/provider/_abstract.js';
import util from '$lib/util.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
  const accounts = await auth.api.listUserAccounts({ headers: request.headers });

  return {
		title: 'test-pick',
		groups: (await Promise.all(accounts.filter(e => e.providerId !== 'credential').map(async e => {
			const repos = await _abstract.generate(e.providerId).repos((await auth.api.getAccessToken({
				body: Object.assign(structuredClone(e), { accountId: e.id }),
				headers: request.headers,
			})).accessToken);

			const order = ['Private', 'Public'];
			
			const list = util.groupList(repos, e => order[+e.isPrivate]);

			return list.sort(util.sort.conform(order, e => e.key)).map(({ key, value: options }) => ({
				account: e,
				label: `${ _abstract._map[e.providerId].name } (${ key })`,
				options,
			}));
		}))).flat(),
	};
};
