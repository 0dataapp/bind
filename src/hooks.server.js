import { auth } from '$lib/auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import bind from 'bind-middleware';

import disk from '$lib/hold/disk/main.js';
import git_https from '$lib/hold/git_https/main.js';

if (env.STORAGE_ADAPTER === 'git_https')
  git_https.setupEverything();

import oauth from '$lib/oauth-implicit/main.js';

import { sequence } from '@sveltejs/kit/hooks';

import db from '$lib/database/main.js';
const _db = db.collection('user');

const prefix = 'storage';
export const handle = sequence(
  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  async ({ event, resolve }) => {
    event.locals.authenticated = await auth.api.getSession({
      headers: event.request.headers,
    });
    return resolve(event);
  },
  bind.sveltekit(bind.cors()),
	bind.sveltekit(bind.storage({
	  getScope: oauth.getScope,
	  storage: env.STORAGE_ADAPTER === 'git_https' ? git_https : disk,
	}), `/${ prefix }`),
  bind.sveltekit(bind.webfinger({
    storagePath: handle => {
    	const user = _db.getItems().filter(e => e.username === handle).shift();
    	return `/${ prefix }/${ user ? user.id : '' }`;
    },
    authPath: '/oauth',
  })),
);
