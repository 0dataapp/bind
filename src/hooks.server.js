import { auth } from '$lib/auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import bind from 'bind-middleware';

import hold from '$lib/hold.js';
Object.keys(hold._wrappers).forEach(wrapperId => hold.interface(wrapperId).startup());

import local from '$lib/hold/local.js';
import git_https from '$lib/hold/git_https.js';

import depot from '$lib/depot.js';

import oauth from '$lib/oauth-implicit.js';

import { sequence } from '@sveltejs/kit/hooks';

import db from '$lib/database.js';
const _db = db.collection('user');

const prefix = '/storage';
export const handle = sequence(

  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  
  async ({ event, resolve }) => {
    event.locals.authenticated = await auth.api.getSession({
      headers: event.request.headers,
    });
    return resolve(event);
  },
  
  bind.sveltekit(bind.cors()),
	
  async params => {
    const { pathname } = new URL(params.event.request.url);
    if (!pathname.startsWith(prefix))
      return params.resolve(params.event);

    let hold = local.middleware;

    const token = bind._parseToken(params.event.request.headers.get('authorization'))
    if (token) {
      const [handle, publicFolder, _url] = bind._parsePathname(pathname.slice(prefix.length));
      
      if (!publicFolder) {
        const authorization = await oauth.authorization(handle, token);

        if (authorization && authorization.data.depotId !== 'local_custody') {
          hold = git_https.middleware(await depot.depotURL(authorization.data.depotId));
        }
      }
    }
    
    return bind.sveltekit(bind.storage({
      getScope: oauth.getScope,
      hold,
    }), prefix)(params)
  },
  
  bind.sveltekit(bind.webfinger({
    storagePath: handle => `${ prefix }/${ handle }`,
    authPath: '/oauth',
  })),
  
);
