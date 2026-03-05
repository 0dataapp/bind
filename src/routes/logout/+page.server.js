import { auth } from '$lib/auth/config';
import { redirect } from '@sveltejs/kit';

/** @type {import('./$types').PageServerLoad} */
export async function load({ request, locals }) {
  if (locals.authenticated)
    await auth.api.signOut({ headers: request.headers });
  
  return redirect(307, '/');
};
