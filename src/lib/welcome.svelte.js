import db from '$lib/database.js';

export const state = $state({
	storedUsers: null,
});

db.collection('user').hydrating.getItems().then(e => state.storedUsers = e.length);
