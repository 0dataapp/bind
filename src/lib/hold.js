import local_disk from './hold/local_disk.js';
import git_https from './hold/git_https.js';

const mod = {

	_wrappers: {
		local_disk,
		git_https,
	},

	wrapperId: e => {
		if ([
			'github',
			'gitea_selfhosted',
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
