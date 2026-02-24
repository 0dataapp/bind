import { auth } from '$lib/better-auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';
import { env } from '$env/dynamic/private';

import bind from 'bind-middleware';

import disk from '$lib/storage/disk/main.js';
import git from '$lib/storage/git/main.js';

import oauth from '$lib/oauth-implicit/main.js';

import { sequence } from '@sveltejs/kit/hooks';

import db from '$lib/database/main.js';
const _db = db.collection('user');

const prefix = 'storage';
export const handle = sequence(
  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  bind.sveltekit(bind.cors()),
	bind.sveltekit(bind.storage({
	  getScope: oauth.getScope,
	  storage: env.STORAGE_ADAPTER === 'git' ? git : disk,
	}), `/${ prefix }`),
  bind.sveltekit(bind.webfinger({
    prefix,
    swapHandle: handle => {
    	const user = _db.getItems().filter(e => e.username === handle).shift();
    	return user ? user.id : '';
    },
  })),
);
