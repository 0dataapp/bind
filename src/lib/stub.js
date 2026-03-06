import { test, expect } from '@playwright/test';

const mod = {

	slug: () => Date.now().toString(36),
	
	domain: () => `${ mod.slug() }.xyz`,
	
	email: () => `${ mod.slug() }@${ mod.domain() }`,
	
	password: () => Math.random().toString().slice(2),
	
	account: () => ({
		email: mod.email(),
		password: mod.password(),
	}),

	origin: () => `http://${ mod.domain() }`,

	scope: () => `${ mod.slug() }:rw`,

	signedIn (startPage) {
		const extended = test.extend({
			account: ({ page }, use) => use(mod.account()),
		});

		extended.beforeEach(async ({ page, account }) => {
			if (startPage && startPage !== '/logout') {
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

		if (startPage && startPage !== '/dash')
			extended('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));

		if (startPage !== '/logout')
			extended('logout', ({ page }) => expect(page.locator('a[href="/logout"]')).toHaveText('Sign out'));

		return extended;
	},

};

export default mod;
