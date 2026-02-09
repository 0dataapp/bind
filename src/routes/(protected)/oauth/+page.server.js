import { tokens } from '$lib/tokens';

import { error, redirect } from '@sveltejs/kit';

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

/** @type {import('./$types').PageServerLoad} */
export function load({ url }) {
	const params = Object.fromEntries(url.searchParams);
	const message = mod.error(params);
	return message ? error(400, {
		message,
	}) : {
		params,
	};
}

/** @satisfies {import('./$types').Actions} */
export const actions = {
	
	default: async ({ request, url, locals }) => {
		const formData = await request.formData();

		const token = await tokens.createToken(locals.user.handle, {
			scope: url.searchParams.get('scope'),
			client_id: url.searchParams.get('client_id'),
		});

		const state = url.searchParams.get('state');
		return redirect(301, `${ url.searchParams.get('redirect_uri') }#access_token=${ token }${ state ? `&state=${ state }` : ''}`);
	},

};
