import local from './hold/local.js';
import git_https from './hold/git_https.js';

const mod = {

	_wrappers: {
		local,
		git_https,
	},

	wrapperId: e => {
		if ([
			'github',
		].includes(e))
			return 'git_https';

		throw new Error('unknown depot');
	},

	interface: depotId => ({

		prepare: () => (mod._wrappers[mod.wrapperId(depotId)].prepare || (() => {}))(),

	}),

};

export default mod;
