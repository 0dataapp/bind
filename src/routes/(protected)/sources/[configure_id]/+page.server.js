import db from '$lib/database.js';
import util from '$lib/util.js';

import { auth } from '$lib/auth/config';
import { redirect } from '@sveltejs/kit';
import depot from '$lib/depot.js';
import hold from '$lib/hold.js';

const maxItems = 5;

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, params }) {
  const { name } = (depot.options[params.configure_id] || {}).meta || {};
  const account = (await auth.api.listUserAccounts({ headers: request.headers })).filter(e => e.providerId === params.configure_id).shift();

  if (!account || !name)
  	return redirect(307, '/sources');

  const { accessToken } = await auth.api.getAccessToken({
  	body: { providerId: account.providerId, accountId: account.accountId },
  	headers: request.headers,
  });
  
  const repos = await depot.endpoint(account.providerId).repos({
  	accessToken,
  });

  const order = ['Private', 'Public'];
  
  const list = util.group.asArray(repos, e => order[+!e.isPrivate]);

  const isExternal = e => e.ownerId.toString() !== account.accountId.toString();

  return {
		title: `Configure ${ name }`,
		name,
		account,
		selected: (await db.collection('datasource').hydrating.getItems()).filter(e => e.accountId === account.id).map(e => e.data),
		groups: list.sort(util.sort.conform(order, e => e.key)).map(({ key, values }) => ({
	  	account,
	  	label: key,
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
			return redirect(307, '/sources');

		const _hold = hold.options[hold.identifier(params.configure_id)];

		const sources = JSON.parse((await request.formData()).get('sources') || '[]').slice(0, maxItems);
		const items = (await db.collection('datasource').hydrating.getItems()).filter(e => e.accountId === account.id);

		const removed = items.filter(e => !sources.map(e => e.id).includes(e.foreignId));
		await Promise.all(removed.map(e => db.collection('datasource').__delete(e.id)));
		removed.forEach(e => _hold.filesystem(e.data.cloneURL).erase?.());

		const created = await Promise.all(sources.filter(e => !items.map(e => e.foreignId).includes(e.id)).map(data => db.collection('datasource').hydrating.create({
			id: db.generateId(),
			foreignId: data.id,
			accountId: account.id,
			createdAt: new Date(),
			data,
		})));

		const { accessToken } = await auth.api.getAccessToken({
			body: { providerId: account.providerId, accountId: account.accountId },
			headers: request.headers,
		});
		
		created.map(e => e.data).forEach(source => _hold.task?.prepare?.(source.cloneURL, source.cloneURLTemplate.replace('{token}', accessToken)));

		return redirect(303, '/sources');
	},

};
