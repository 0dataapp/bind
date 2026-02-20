import logic from './logic.js';

/** @type {import('./$types').PageLoad} */
export function load({ data }) {
	return {
		title: 'Authorize',
		redirect_uri: data.params.redirect_uri,
		client_id: data.params.client_id,
		scopes: logic.parseScopes(data.params.scope),
	};
}
