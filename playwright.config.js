import { defineConfig, test } from '@playwright/test';
import path from 'path';

import { addAliases } from 'module-alias';
addAliases({
	$lib: path.resolve(process.cwd(), 'src/lib'),
});

export const STORAGE_STATE = path.join(process.cwd(), '__playwright/.auth/user.json');
process.env.ACCOUNT_DATA = path.join(path.dirname(STORAGE_STATE), 'account_data.json');

export default defineConfig({
	webServer: {
		command: 'npm run env:test',
		port: 4173,
	},
	testDir: 'src/routes',
	outputDir: '__playwright',
	workers: 1,
	projects: [
		{
			name: 'public',
			testMatch: /routes(?!\/\(protected\)\/)(\/.*)?\/ui-tests.js/,
		},
		{
			name: 'protected-setup',
			testMatch: /\(protected\)\/ui-tests-setup\.js/,
		},
		{
			name: 'protected',
			dependencies: ['protected-setup'],
			use: {
				storageState: STORAGE_STATE,
			},
			testMatch: /\(protected\)(\/.*)?\/ui-tests.js/,
		},
	]
});
