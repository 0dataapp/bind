import { test, expect } from '@playwright/test';

test.describe('logout', () => {

	test('redirects to home', async ({ page }) => {
		await page.goto('/logout');

		expect(page).toHaveURL('/')
	});

	test('logs out', async ({ page }) => {
		await page.goto('/logout');

		await page.goto('/dash');

		expect(page).toHaveURL(/\/login/);
	});

});
