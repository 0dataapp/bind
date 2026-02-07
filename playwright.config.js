import { defineConfig } from '@playwright/test';

export default defineConfig({
	webServer: {
		command: 'npm start',
		port: 5173,
	},
	testDir: 'src/routes',
	testMatch: /routes(\/.*)?\/ui-tests.js/,
	outputDir: '__playwright',
});
