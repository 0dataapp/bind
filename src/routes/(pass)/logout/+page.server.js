import { auth } from '$lib/better-auth/config';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request }) {
  await auth.api.signOut({ headers: request.headers });
  return redirect(307, '/');
};
