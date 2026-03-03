import db from '$lib/database.js';
const _db = db.collection('oauth_implicit_grant');

const mod = {

	_generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	createToken (userId, data) {
		const token = mod._generateToken();

		_db.hydrating.create({
			id: db.generateId(),
			userId,
			token,
			createdAt: new Date(),
			data,
		});

		return token;
	},

	getScope: (userId, token) => _db.hydrating.getItems().filter(e => e.userId === userId && e.token === token).shift()?.data?.scope,

	authorizations: userId => _db.hydrating.getItems().filter(e => e.userId === userId),

	revokeClient: (userId, client) => Promise.all(mod.authorizations(userId).filter(e => e.data.client_id === client).map(e => _db.__delete(e.id))),
	
	revokeAll: userId => Promise.all(mod.authorizations(userId).map(e => _db.__delete(e.id))),

};

export default mod
