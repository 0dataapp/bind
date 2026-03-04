import db from '$lib/database.js';
const _db = db.collection('oauth_implicit_grant');

const mod = {

	_generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	createToken (username, data) {
		const token = mod._generateToken();

		_db.hydrating.create({
			id: db.generateId(),
			username,
			token,
			createdAt: new Date(),
			data,
		});

		return token;
	},

	authorizations: async username => (await _db.hydrating.getItems()).filter(e => e.username === username),

	authorization: async (username, token) => (await mod.authorizations(username)).filter(e => e.token === token).shift(),

	getScope: async (username, token) => (await mod.authorization(username, token))?.data?.scope,

	revokeClient: async (username, client) => Promise.all((await mod.authorizations(username)).filter(e => e.data.client_id === client).map(e => _db.__delete(e.id))),
	
	revokeAll: async username => Promise.all((await mod.authorizations(username)).map(e => _db.__delete(e.id))),

};

export default mod
