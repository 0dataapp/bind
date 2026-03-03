import db from '$lib/database.js';
const _db = db.collection('oauth_implicit_grant');

import util from '$lib/util.js';

const mod = {

	_generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	createToken (userId, data) {
		const token = mod._generateToken();

		_db.create(util.dehydrate({
			id: db.generateId(),
			userId,
			token,
			createdAt: new Date(),
			data,
		}));

		return token;
	},

	getScope: (userId, token) => _db.getItems().filter(e => e.userId === userId && e.token === token).map(util.hydrate).shift()?.data?.scope,

	authorizations: userId => _db.getItems().filter(e => e.userId === userId).map(util.hydrate),

	revokeClient: (userId, client) => Promise.all(mod.authorizations(userId).filter(e => e.data.client_id === client).map(e => _db.delete(e.id))),
	
	revokeAll: userId => Promise.all(mod.authorizations(userId).map(e => _db.delete(e.id))),

};

export default mod
