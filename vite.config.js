import { defineConfig, loadEnv } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, process.cwd(), '');
	return {
		plugins: [sveltekit()],
		test: {
			hideSkippedTests: true,
			expect: { requireAssertions: true },
			experimental: {
				preParse: true,
			},
			projects: [
				{
					extends: './vite.config.js',
					test: {
						name: 'server',
						environment: 'node',
    				include: ['src/**/*-tests.{js,ts}', 'src/**/tests.{js,ts}'],
    				exclude: ['**/ui-tests.{js,ts}'],
					},
				},
			],
		},
		server: {
			host: env.HOST,
			port: env.PORT,
			allowedHosts: [ env.HOST ],
		},
		build: {
			rollupOptions: {
				external: ['dotenv'],
			},
		},
	};
});
