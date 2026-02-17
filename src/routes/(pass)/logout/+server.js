import { auth } from '$lib/better-auth/config';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').LayoutServerLoad} */
export async function GET({ request }) {
  await auth.api.signOut({ headers: request.headers });
  return redirect(307, '/');
};
