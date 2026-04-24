import { defineConfig, loadEnv } from 'vite';
import adapter from '@sveltejs/adapter-node';
const env = loadEnv(process.cwd(), '');

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter({}),
		csrf: {
			checkOrigin: false,
		},
		version: {
			name: JSON.stringify({
				sha: env.VITE_COMMIT_HASH ? env.VITE_COMMIT_HASH.trim().slice(0, 8) : undefined,
				built: new Date(new Date().setSeconds(0, 0)).toJSON().replace(':00.000', '').replace('T', '×').replaceAll('-', '.').toLowerCase(),
			}),
		},
	},
};

export default config;
