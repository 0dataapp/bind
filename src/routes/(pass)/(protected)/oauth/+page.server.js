import { auth } from '$lib/auth/config';
import db from '$lib/database.js';
import depot from '$lib/depot.js';

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

	depots: async request => {
		const sources = await db.collection('account_source').hydrating.getItems();

		return (await auth.api.listUserAccounts({
			headers: request.headers,
		})).filter(e => e.providerId !== 'credential').map(e => {
			Object.assign(e = structuredClone(e), {
				name: depot.options.asMap[e.providerId],
			});

			if (e.providerId === 'github')
				e._sources = sources.filter(source => source.accountId === e.id);
			
			return e;
		}).concat({
			id: 'local_custody',
			name: depot.options.asMap.local_custody,
		}).map(e => Object.assign(e, e._sources ? {
			_sources: e._sources.map(source => Object.assign(source, {
				optionId: `${ e.id }:${ source.id }`,
			})),
		} : {
			optionId: e.id,
		}));
	},

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
		depots: await mod.depots(request),
	};
};

import oauth from '$lib/oauth-implicit.js';
import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, url }) => {
		const formData = await request.formData();

		const _depot = (await mod.depots(request)).map(e => e._sources ? e._sources : e).flat().filter(e => e.optionId === formData.get('_depot')).shift();

		if (!_depot)
			return {};

		const token = await oauth.createToken((await auth.api.getSession({
			headers: request.headers,
		})).user.id, {
			scope: url.searchParams.get('scope'),
			client_id: url.searchParams.get('client_id'),
			depotId: _depot.optionId,
			userAgent: request.headers.get('user-agent'),
		});

		const state = url.searchParams.get('state');
		return redirect(301, `${ url.searchParams.get('redirect_uri') }#access_token=${ token }${ state ? `&state=${ state }` : ''}`);
	},

};
