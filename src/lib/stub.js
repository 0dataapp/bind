import { test, expect } from '@playwright/test';

const mod = {

	domain: () => `${ Date.now().toString(36) }.xyz`,
	
	email: () => `${ 'example' || Math.random().toString(36) }@${ mod.domain() }`,
	
	account: () => ({
		email: mod.email(),
		password: Math.random().toString(),
	}),

	origin: () => `http://${ mod.domain() }`,

	scope: () => `${ Date.now().toString(36) }:rw`,

	signedIn: () => {
		const extended = test.extend({
		  account: ({ page }, use) => use(mod.account()),
		});

		extended.beforeEach(async ({ page, account }) => {
		  await page.goto('/signup');

		  await page.locator('#email').fill(account.email);
		  await page.locator('#password').fill(account.password);
		  await page.locator('input[type="submit"]').click();

		  await expect(page).toHaveURL(/\/dash/);
		});

		return extended;
	},

};

export default mod;
