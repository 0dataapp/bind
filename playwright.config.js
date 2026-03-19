import { defineConfig } from '@playwright/test';
import path from 'path';

import { addAliases } from 'module-alias';
addAliases({
  $lib: path.resolve(process.cwd(), 'src/lib'),
});

export default defineConfig({
	webServer: {
		command: 'npm run env:test',
		port: 4173,
	},
	testDir: 'src/routes',
	testMatch: /routes(\/.*)?\/ui-tests.js/,
	outputDir: '__playwright',
	workers: 1,
});
