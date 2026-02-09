import { _tokens } from 'token-store';

_tokens.configure(process.env);

export const tokens = _tokens;
