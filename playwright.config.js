import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm run env:test',
		port: 4173,
	},
	testDir: 'src/routes',
	testMatch: /routes(\/.*)?\/ui-tests.js/,
	outputDir: '__playwright',
});
