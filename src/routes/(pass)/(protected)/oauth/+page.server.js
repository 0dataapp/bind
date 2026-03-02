import { auth } from '$lib/auth/config';
import db from '$lib/database/main.js';
import depot from '$lib/depot.js';
import util from '$lib/util.js';

const mod = {

	error: params => {
	  if (!params.client_id)
	  	return 'missing `client_id`';

	  if (!params.response_type)
	  	return 'missing `response_type`';

	  if (!params.scope)
	  	return 'invalid `scope`';

	  if (!params.redirect_uri)
	  	return 'missing `redirect_uri`';

	  if (params.response_type !== 'token')
	  	return '`response_type` mult be `token`';

	  return false;
	},

	stores: async request => Promise.all((await auth.api.listUserAccounts({
		headers: request.headers,
	})).map(async e => {

		Object.assign(e = structuredClone(e), {
			name: depot.options.asMap[e.providerId],
		});

		if (e.providerId === 'github')
			e._sources = (await db.collection('account_source').getItems()).filter(source => source.accountId === e.id).map(util.hydrate);
		
		return e;
	})),

};

import { error } from '@sveltejs/kit';
import logic from './logic.js';

/** @type {import('./$types').PageServerLoad} */
export async function load({ url, request }) {
	const params = Object.fromEntries(url.searchParams);

	const message = mod.error(params);
	return message ? error(400, {
		message,
	}) : {
		title: 'Authorize',
		redirect_uri: params.redirect_uri,
		client_id: params.client_id,
		scopes: logic.parseScopes(params.scope),
		stores: await mod.stores(request),
	};
}

import oauth from '$lib/oauth-implicit/main.js';
import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, url }) => {
		const formData = await request.formData();

		const store = (await mod.stores(request)).map(e => e._sources ? e._sources.map(source => ({
			storeId: `${ e.id }:${ source.id }`,
			account: e,
		})) : ({
			storeId: e.id,
			account: e,
		})).flat().filter(e => e.storeId === formData.get('store')).shift();
		
		if (!store)
			return {};

		const token = await oauth.createToken((await auth.api.getSession({
			headers: request.headers,
		})).user.id, {
			scope: url.searchParams.get('scope'),
			client_id: url.searchParams.get('client_id'),
			storeId: store.storeId,
			userAgent: request.headers.get('user-agent'),
		});

		const state = url.searchParams.get('state');
		return redirect(301, `${ url.searchParams.get('redirect_uri') }#access_token=${ token }${ state ? `&state=${ state }` : ''}`);
	},

};
