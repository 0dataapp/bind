import local_custody from './hold/local_custody.js';
import git_https from './hold/git_https.js';

const mod = {

	_wrappers: {
		local_custody,
		git_https,
	},

	wrapperId: e => {
		if ([
			'github',
		].includes(e))
			return 'git_https';

		throw new Error('unknown depot');
	},

	interface: wrapperId => Object.fromEntries([
		'startup',
		'prepare',
		'erase',
	].map(method => [method, mod._wrappers[wrapperId].hold[method]])),

};

export default mod;
