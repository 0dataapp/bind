import { options } from './hold/options.js';

const mod = {

	options,

	identifier: e => {
		if ([
			'github',
			'gitea_selfhosted',
		].includes(e))
			return 'git_https';

		if (e === 'local_custody')
			return 'local_disk';

		throw new Error('unknown depot');
	},

};

export default mod;
