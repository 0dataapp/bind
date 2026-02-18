import db from '$lib/database/main.js';

const _db = db.collection('oauth_implicit_grant');

const params = {};
const scopes = {};

const mod = {

	_generateToken: () => Array.from(crypto.getRandomValues(new Uint8Array(32)), byte => byte.toString(16).padStart(2, '0')).join(''),

	_dehydrate: object => {
	  return Object.assign(object, {
	  	data: JSON.stringify(object.data),
	  });
	},

	_hydrate: object => {
	  return typeof object.data !== 'string' ? object : Object.assign(object, {
	    createdAt: new Date(object.createdAt),
	    data: JSON.parse(object.data),
	  });
	},

	createToken: (userId, data) => {
		const token = mod._generateToken();

		_db.create(mod._dehydrate({
			id: db.generateId(),
			userId,
			token,
			createdAt: new Date(),
			data: data,
		}));

		return token;
	},

	getScope: (userId, token) => _db.getItems().filter(e => e.userId === userId && e.token === token).map(mod._hydrate).shift()?.data?.scope,

};

export default mod
