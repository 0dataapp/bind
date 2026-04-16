import { auth } from '$lib/auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import glue from '$lib/glue.js';

import hold from '$lib/hold.js';
for (const key in hold.options)
  hold.options[key].hold?.startup?.();

import local_disk from '$lib/hold/local_disk.js';
import git_https from '$lib/hold/git_https.js';

import depot from '$lib/depot/auth.js';

import oauth from '$lib/oauth-implicit.js';

import { sequence } from '@sveltejs/kit/hooks';

import { state } from '$lib/welcome.svelte.js';
import { redirect } from '@sveltejs/kit';

const prefix = '/storage';
export const handle = sequence(

  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  
  async ({ event, resolve }) => {
    return !state.storedUsers && !event.request.url.match('/welcome') ? redirect(301, '/welcome') : resolve(event);
  },
  
  async ({ event, resolve }) => {
    event.locals.authenticated = await auth.api.getSession({
      headers: event.request.headers,
    });
    return resolve(event);
  },
  
  glue.util.sveltekit(glue.cors()),
	
  ({ event, resolve }) => {
    const { pathname } = new URL(event.request.url);
    if (!pathname.startsWith(prefix))
      return resolve(event);

    return glue.util.sveltekit(glue.remotestorage({
      getScope: oauth.getScope,
      async getFS (handle, token) {
        const authorization = await oauth.authorization(handle, token);
        if (authorization && authorization.data.depotId !== 'local_custody')
          return git_https.filesystem(await depot.depotURL(authorization.data.depotId));

        return local_disk.filesystem(handle);
      },
    }), prefix)({ event, resolve })
  },
  
  glue.util.sveltekit(glue.webfinger({
    storagePath: handle => `${ prefix }/${ handle }`,
    authPath: '/authorize',
  })),
  
);
