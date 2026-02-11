const params = {};
const scopes = {};

const mod = {

	generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	fetch: (method = 'GET', body) => fetch(`${ params.RS_SERVER_URI }/rs-bind/tokens.json`, {
	  headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${ params.RS_TOKEN }`,
		},
	  method,
	  body,
	}),

	getTokens: async () => {
		if (!params.RS_SERVER_URI)
			throw new Error('RS_SERVER_URI not set');

		if (!params.RS_TOKEN)
			throw new Error('RS_TOKEN not set');

		const res = await mod.fetch();

		if ([200, 404].includes(res.status))
			return Object.assign(scopes, res.status === 200 ? await res.json() : {});

		throw new Error(`RS_SERVER_URI response status: ${ res.status }`);
	},

	putTokens: data => mod.fetch('PUT', JSON.stringify(data)),

};

export const _tokens = {

	configure: object => {
		Object.assign(params, object);

		if (!params.building)
			mod.getTokens();
	},

	createToken: async (handle, data) => {
		const token = mod.generateToken();

		(scopes[handle] = scopes[handle] || {})[token] = Object.assign(data, {
			createdAt: new Date(),
		});

		await mod.putTokens(scopes);

		return token;
	},

	getScope: (handle, token) => ((scopes[handle] || {})[token] || {}).scope,

};
