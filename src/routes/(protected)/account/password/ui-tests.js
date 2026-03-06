import { expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

const test = stub.signedIn('/account/password');

test.describe('password', () => {

	test.describe('title', () => {

		test('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

		test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
		
	});

	test.describe('form', () => {

		test.describe('oldPassword', () => {

			test('label', ({ page }) => expect(page.locator('label[for="oldPassword"]')).toHaveText('Current password'));

			test.describe('input', () => {

				test('type', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('type', 'password'));

				test('placeholder', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('placeholder', '…'));

				test('required', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('required', ''));

			});
			
		});

		test.describe('newPassword', () => {

			test('label', ({ page }) => expect(page.locator('label[for="newPassword"]')).toHaveText('New password'));

			test.describe('input', () => {

				test('type', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('type', 'password'));

				test('placeholder', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('placeholder', '…'));

				test('required', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('required', ''));

			});
			
		});

		test.describe('confirmPassword', () => {

			test('label', ({ page }) => expect(page.locator('label[for="confirmPassword"]')).toHaveText('Confirm password'));

			test.describe('input', () => {

				test('type', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password'));

				test('placeholder', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('placeholder', '…'));

				test('required', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('required', ''));

			});
			
		});

		test.describe('submit', () => {

			test('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

			test.describe('error', () => {

				test('shows error', async ({ page, account }) => {
					await page.locator('#oldPassword').fill(account.password);
					await page.locator('#newPassword').fill(stub.password());
					await page.locator('#confirmPassword').fill(stub.password());
					await page.locator('input[type="submit"]').click();

					await expect(page.locator('flash.error')).toBeVisible();
					expect(page.locator('flash.error')).toHaveText('New password should match confirmation');
				});
				
			});

			test('success', async ({ page, account }) => {
				const newPassword = stub.password();
				await page.locator('#oldPassword').fill(account.password);
				await page.locator('#newPassword').fill(newPassword);
				await page.locator('#confirmPassword').fill(newPassword);
				await page.locator('input[type="submit"]').click();

				await expect(page.locator('flash.success')).toBeVisible();
				expect(page.locator('flash.success')).toHaveText('Password changed');
			});
			
		});
		
	});

});
