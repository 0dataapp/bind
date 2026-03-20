import { state } from '$lib/welcome.svelte.js';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ locals }) {
	return state.storedUsers ? redirect(307, '/login') : {};
};
