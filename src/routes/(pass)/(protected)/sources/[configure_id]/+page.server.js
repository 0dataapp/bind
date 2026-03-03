import db from '$lib/database.js';
const _db = db.collection('account_source');
import util from '$lib/util.js';

import { auth } from '$lib/auth/config';
import { redirect } from '@sveltejs/kit';
import depot from '$lib/depot.js';

const maxItems = 10;

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, params }) {
  const account = (await auth.api.listUserAccounts({ headers: request.headers })).filter(e => e.providerId === params.configure_id).shift();

  if (!account)
  	return redirect(307, '/sources');

  const { name } = depot._map[params.configure_id] || {};

  if (!name)
  	return redirect(307, '/sources');

  const e = account;

  const { accessToken } = await auth.api.getAccessToken({
  	body: Object.assign(structuredClone(e), { accountId: e.id }),
  	headers: request.headers,
  });
  const repos = await depot.endpoint(e.providerId).repos(accessToken);

  const order = ['Private', 'Public'];
  
  const list = util.group.asArray(repos, e => order[+!e.isPrivate]);

  const isExternal = e => e.ownerId.toString() !== account.accountId.toString();

  return {
		title: `Configure ${ name }`,
		name,
		account,
		selected: (await _db.hydrating.getItems()).filter(e => e.accountId === account.id).map(e => e.data),
		groups: list.sort(util.sort.conform(order, e => e.key)).map(({ key, values }) => ({
	  	account: e,
	  	label: `${ depot._map[e.providerId].name } (${ key })`,
	  	options: values.map(e => Object.assign(structuredClone(e), {
	  		name: isExternal(e) ? e.scopedName : e.name,
	  	})).sort(util.sort.asc(e => e.name)).sort(util.sort.asc(e => isExternal(e))),
	  })).flat(),
	  maxSize: depot.maxSize(),
	  maxItems,
	};
};
	
/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, params }) => {
		const account = (await auth.api.listUserAccounts({ headers: request.headers })).filter(e => e.providerId === params.configure_id).shift();

		if (!account)
			return redirect(307, '/sources')

		const sources = JSON.parse((await request.formData()).get('sources')).slice(0, maxItems);
		const items = (await _db.__getItems()).filter(e => e.accountId === account.id);

		await Promise.all(items.filter(e => !sources.map(e => e.id).includes(e.foreignId)).map(e => _db.__delete(e.id)));

		await Promise.all(sources.filter(e => !items.map(e => e.foreignId).includes(e.id)).map(data => _db.hydrating.create({
			id: db.generateId(),
			foreignId: data.id,
			accountId: account.id,
			createdAt: new Date(),
			data,
		})));

		return redirect(303, '/sources');
	},

};
