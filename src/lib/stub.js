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

	signedIn: startPage => {
		const extended = test.extend({
		  account: ({ page }, use) => use(mod.account()),
		});

		extended.beforeEach(async ({ page, account }) => {
			if (startPage) {
				await page.goto(startPage);
				await expect(page).toHaveURL(/\/login/);
			}

		  await page.goto('/signup');

		  await page.locator('#email').fill(account.email);
		  await page.locator('#password').fill(account.password);
		  await page.locator('input[type="submit"]').click();

		  await expect(page).toHaveURL(/\/dash/);

		  if (startPage)
		  	await page.goto(startPage);
		});

		if (startPage !== '/dash')
			extended('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));

  	extended('logout', ({ page }) => expect(page.locator('a[href="/logout"]')).toHaveText('Sign out'));

		return extended;
	},

};

export default mod;
