import { RS_SERVER_URI, RS_TOKEN } from '$env/static/private';
import { building } from '$app/environment';
import { _tokens } from './main';

_tokens.configure({
	RS_SERVER_URI,
	RS_TOKEN,
	building,
});

export const tokens = _tokens;
