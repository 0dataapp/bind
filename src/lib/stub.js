import { test, expect } from '@playwright/test';
import fs from 'fs';

const mod = {

	random: () => Math.random().toString(36).slice(2),
	
	ulid: () => Date.now().toString(36) + mod.random().slice(0, 4),
	
	slug: () => mod.random(),
	
	basename: () => `${ mod.ulid() }.txt`,
	
	headers: contentType => ({
		'Content-Type': contentType,
	}),
	
	domain: () => `${ mod.slug() }.xyz`,
	
	email: () => `${ mod.slug() }@${ mod.domain() }`,
	
	password: () => mod.random(),
	
	account: () => ({
		email: mod.email(),
		password: mod.password(),
	}),

	origin: () => `http://${ mod.domain() }`,

	scope: () => `${ mod.slug() }:rw`,

	signedIn2: () => test.extend({
		account: ({}, use) => use(JSON.parse(fs.readFileSync(process.env.ACCOUNT_DATA, 'utf-8'))),
	}),

	signedIn3: startPage => ({ page }) => {
		if (startPage !== '/dash')
			expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard');

		if (startPage !== '/logout')
			expect(page.locator('a[href="/logout"]')).toHaveText('Sign out');
	},

	authorizeApp: async ({ page }) => {
    await page.goto('/sample-app');
    await page.locator('a[role="button"]').click();
    await expect(page).toHaveURL(/\/authorize/);
    await page.locator('select').selectOption('local_custody');
    await page.locator('input[type="submit"]').click();
    await expect(page).toHaveURL(/\/sample-app/);
    await page.goto('/connected');
  },

};

export default mod;
