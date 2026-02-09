import { env } from '$env/dynamic/private';

const sessions = {};

export const db = $state({

	getUser: handle => env.CHEAP_LOGINS.split(',').map(e => {
		const [handle, hash] = e.split(':');
		return { handle, hash };
	}).filter(e => e.handle === handle).shift(),

	hash: async (message, algo = 'SHA-1') =>  Array.from(new Uint8Array(await crypto.subtle.digest(algo, new TextEncoder().encode(message))), byte => byte.toString(16).padStart(2, '0')).join(''),

	createSession: user => {
		const session = `${ new Date().toJSON() }-${ Math.random().toString() }`;

		sessions[session] = user.handle;

		return session;
	},

	getSession: session => sessions[session],
	
});
