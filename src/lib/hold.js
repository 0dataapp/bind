import { options } from './hold/options.js';

const mod = {

	options,

	identifier: e => {
		const mapped = {
			github: 'github_api',
			local_custody: 'local_disk',
		}[e];

		if (mapped)
			return mapped;

		if ([
			'gitea_selfhosted',
		].includes(e))
			return 'git_https';

		throw new Error('unknown depot');
	},

};

export default mod;
