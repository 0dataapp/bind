import adapter from '@sveltejs/adapter-node';
import * as child_process from 'node:child_process';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({}),
		csrf: {
			checkOrigin: false,
		},
		version: {
			name: JSON.stringify({
				sha: child_process.execSync('git rev-parse HEAD').toString().trim().slice(0, 8),
				built: new Date(new Date().setSeconds(0, 0)).toJSON().replace(':00.000', '').replace('T', '×').replaceAll('-', '.').toLowerCase(),
			}),
		},
	},
};

export default config;
