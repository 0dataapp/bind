import { auth } from '$lib/better-auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

import bind from 'bind-middleware';

import storage from '$lib/storage/main.js';
import { tokens } from '$lib/tokens.js';

import { sequence } from '@sveltejs/kit/hooks';

const prefix = 'storage';
export const handle = sequence(
  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  bind.sveltekit(bind.cors()),
	bind.sveltekit(bind.storage({
	  getScope: tokens.getScope,
	  storage,
	}), `/${ prefix }`),
  bind.sveltekit(bind.webfinger({
    prefix,
  })),
);
