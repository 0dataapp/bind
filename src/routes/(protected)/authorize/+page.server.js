import { auth } from '$lib/auth/config';
import depot from '$lib/depot/auth.js';

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
		depots: (await depot.options(request)).filter(e => !e._subsources || e._subsources.length),
	};
};

import oauth from '$lib/auth/oauth-implicit.js';
import { redirect } from '@sveltejs/kit';

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, url }) => {
		const formData = await request.formData();

		const _depot = (await depot.options(request)).map(e => e._subsources ? e._subsources : e).flat().filter(e => e.optionId === formData.get('_depot')).shift();

		if (!_depot)
			return {};

		const token = await oauth.createToken((await auth.api.getSession({
			headers: request.headers,
		})).user.username, {
			scope: url.searchParams.get('scope'),
			client_id: url.searchParams.get('client_id'),
			depotId: _depot.optionId,
			userAgent: request.headers.get('user-agent'),
		});

		const state = url.searchParams.get('state');
		return redirect(301, `${ url.searchParams.get('redirect_uri') }#access_token=${ token }${ state ? `&state=${ state }` : ''}`);
	},

};
