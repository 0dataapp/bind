import { test, expect } from '@playwright/test';
import stub from '$lib/stub.js';

test.describe('logout', () => {

	test('redirects to home', async ({ page }) => {
		await page.goto('/logout');

		expect(page).toHaveURL('/')
	});

	test.describe('signedIn', () => {

		const signedIn = stub.signedIn();

		signedIn('logs out', async ({ page }) => {
			await page.goto('/logout');

			await page.goto('/dash');

			expect(page).toHaveURL(/\/login/);
		});
		
	});

});
