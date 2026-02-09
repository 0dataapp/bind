import { env } from '$env/dynamic/private';
import { building } from '$app/environment';
import { _tokens } from 'token-store';

_tokens.configure({
	RS_SERVER_URI: env.RS_SERVER_URI,
	RS_TOKEN: env.RS_TOKEN,
	building,
});

export const tokens = _tokens;
