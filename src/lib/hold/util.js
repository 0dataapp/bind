import crypto from 'crypto';

const mod = {

	hash: e => crypto.createHash('sha256').update(e).digest('hex').substring(0, 8),

	encoding: contentType => [
		'application/json',
		'text',
	].filter(e => contentType.startsWith(e)).length ? 'utf8' : undefined,

};

export default mod;
