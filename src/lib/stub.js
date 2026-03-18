import { test, expect } from '@playwright/test';

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

	authorizeApp: async ({ page }) => {
    await page.goto('/sample-app');
    await page.locator('a[role="button"]').click();
    await expect(page).toHaveURL(/\/authorize/);
    await page.locator('select').selectOption('local_custody');
    await page.locator('input[type="submit"]').click();
    await page.goto('/connected');
  },

};

export default mod;
