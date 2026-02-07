import { RS_SERVER_URI, RS_TOKEN } from '$env/static/private';
import { building } from '$app/environment';

const scopes = {};

const mod = {

	generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	makeScopePaths (scopes, rootScope) {
	  var i, scopePaths=[];
	  for (i=0; i<scopes.length; i++) {
	    var thisScopeParts = scopes[i].split(':');
	    if (thisScopeParts[0] === rootScope) {
	      scopePaths.push('/:'+thisScopeParts[1]);
	    } else {
	      scopePaths.push('/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
	      scopePaths.push('/public/'+thisScopeParts[0]+'/:'+thisScopeParts[1]);
	    }
	  }
	  return scopePaths;
	},

	fetch: (method = 'GET', body) => fetch(`${ RS_SERVER_URI }/rs-bind/tokens.json`, {
	  headers: {
		  'Content-Type': 'application/json',
		  'Authorization': `Bearer ${ RS_TOKEN }`,
		},
	  method,
	  body,
	}),

	getTokens: async () => {
		if (!RS_SERVER_URI)
			throw new Error('RS_SERVER_URI not set');

		if (!RS_TOKEN)
			throw new Error('RS_TOKEN not set');

		const res = await mod.fetch();

		if ([200, 404].includes(res.status))
			return Object.assign(scopes, res.status === 200 ? await res.json() : {});

		throw new Error(`RS_SERVER_URI response status: ${ res.status }`);
	},

	putTokens: data => mod.fetch('PUT', JSON.stringify(data)),

};

if (!building)
	(async () => mod.getTokens())();

export const tokens = $state({

	createToken: async (handle, _scopes) => {
		const scopePaths = mod.makeScopePaths(_scopes.split(' '));
		 
		const token = mod.generateToken();

		scopes[token] = {
			handle,
			scopePaths,
		};

		await mod.putTokens(scopes);

		return token;
	},

	getScopes: token => scopes[token],

});
