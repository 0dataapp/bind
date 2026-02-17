import { auth } from '$lib/better-auth/config.js';
import { svelteKitHandler } from 'better-auth/svelte-kit';
import { building } from '$app/environment';

import bind from 'bind-middleware';

import storage from '$lib/adapter.js';
import { tokens } from '$lib/tokens.js';

import { sequence } from '@sveltejs/kit/hooks';

import { db } from '$lib/db.svelte';

const _handle = (middleware, path) => async ({ event, resolve }) => {
  if (path && !event.url.pathname.startsWith(path))
    return resolve(event);

  const [protocol, host] = [event.url.protocol.replace(/\:$/, ''), event.url.host];
  const req = {
    url: `${ event.url.pathname }${ event.url.search }`,
    protocol,
    query: event.url.search,
    method: event.request.method,
    headers: Object.fromEntries(event.request.headers),
    get: key => ({
    	host,
    }[key]),
  };

  if (path)
  	req.url = req.url.replace(new RegExp(`^${ path.replaceAll('/', '\\/') }`), '');

  if (req.method === 'PUT' && !event.request.__body)
    event.request.__body = await (function () {
      if (event.request.headers.get('content-type').startsWith('application/json'))
        return event.request.json();

      if (event.request.headers.get('content-type').startsWith('text/'))
        return event.request.text();
      
      return event.request.arrayBuffer();
    })();

  if (req.method === 'PUT')
    req.body = event.request.__body;

  event.__headers = event.__headers || {};

  const res = {
  	set: obj => (Object.keys(obj).forEach(key => event.__headers[key] = obj[key]), res),

    status: code => (res._status = code, res),
    json: obj => res.send(JSON.stringify(obj)),
    send: body => (res.body = body, res.end()),
    end: () => new Response(res.body, {
      status: res._status || 200,
      headers: event.__headers,
    }),
  };

  return middleware(req, res, err => {
  	if (err)
  		throw err;

  	return resolve(event);
  });
};

/** @type {import('@sveltejs/kit').Handle} */
const main = async ({ event, resolve }) => {
	event.locals.user = await db.getUser(db.getSession(event.cookies.get('sessionid')));
	return resolve(event);
};

const prefix = 'storage';
export const handle = sequence(
  ({ event, resolve }) => svelteKitHandler({ event, resolve, auth, building }),
  _handle(bind.cors()),
	_handle(bind.storage({
	  getScope: tokens.getScope,
	  storage,
	}), `/${ prefix }`),
  _handle(bind.webfinger({
    prefix,
  })),
  main,
);
