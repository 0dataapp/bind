import crypto from 'crypto';
import path from 'path';

const mod = {

	hash: e => crypto.createHash('sha256').update(e).digest('hex').substring(0, 8),

	encoding: contentType => contentType && [
		'application/json',
		'text',
	].filter(e => contentType.startsWith(e)).length ? 'utf8' : undefined,
	
	isJunk: e => [
		'.DS_Store',
	].includes(path.basename(e)),

};

export default mod;
