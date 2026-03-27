import { auth } from '$lib/auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import glue from '$lib/glue.js';

import hold from '$lib/hold.js';
Object.keys(hold._wrappers).forEach(wrapperId => hold.interface(wrapperId).startup());

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
	
  async params => {
    const { pathname } = new URL(params.event.request.url);
    if (!pathname.startsWith(prefix))
      return params.resolve(params.event);

    let hold = local_disk.filesystem;

    const token = glue.util.parseToken(params.event.request.headers.get('authorization'))
    if (token) {
      const [handle, publicFolder] = glue.util.parsePathname(pathname.slice(prefix.length));
      
      const authorization = await oauth.authorization(handle, token);
      if (authorization && authorization.data.depotId !== 'local_custody') {
        hold = git_https.filesystem(await depot.depotURL(authorization.data.depotId));
      }
    }
    
    return glue.util.sveltekit(glue.remotestorage({
      getScope: oauth.getScope,
      hold,
    }), prefix)(params)
  },
  
  glue.util.sveltekit(glue.webfinger({
    storagePath: handle => `${ prefix }/${ handle }`,
    authPath: '/authorize',
  })),
  
);
