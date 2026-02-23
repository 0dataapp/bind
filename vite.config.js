import { defineConfig } from 'vite';
import { sveltekit } from '@sveltejs/kit/vite';

export default defineConfig(({ mode }) => {
	return {
		plugins: [sveltekit()],
		test: {
			hideSkippedTests: true,
			expect: { requireAssertions: true },
			projects: [
				{
					extends: './vite.config.js',
					test: {
						name: 'server',
						environment: 'node',
    				include: ['src/**/*-tests.{js,ts}'],
    				exclude: ['**/ui-tests.{js,ts}'],
					},
				},
			],
		},
	};
});
