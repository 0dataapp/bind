import { expect } from '@playwright/test';
import props from './props.js';
import stub from '$lib/stub.js';

const test = stub.signedIn('/account/delete');

test.describe('delete', () => {

	test.describe('title', () => {

		test('head', async ({ page }) => expect(await page.title()).toEqual(props.title));

		test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(props.title));
		
	});

	test.describe('form', () => {

		test.describe('password', () => {

			test('label', ({ page }) => expect(page.locator('label[for="password"]')).toHaveText('Password'));

			test.describe('input', () => {

				test('type', ({ page }) => expect(page.locator('#password')).toHaveAttribute('type', 'password'));

				test('placeholder', ({ page }) => expect(page.locator('#password')).toHaveAttribute('placeholder', '…'));

				test('required', ({ page }) => expect(page.locator('#password')).toHaveAttribute('required', ''));

			});
			
		});

		test.describe('confirm', () => {

			test('label', ({ page }) => expect(page.locator('label[for="confirm"]')).toHaveText('Confirmation (type CONFIRM)'));

			test.describe('input', () => {

				test('type', ({ page }) => expect(page.locator('#confirm')).toHaveAttribute('type', 'text'));

				test('placeholder', ({ page }) => expect(page.locator('#confirm')).toHaveAttribute('placeholder', '…'));

				test('required', ({ page }) => expect(page.locator('#confirm')).toHaveAttribute('required', ''));

			});
			
		});

		test.describe('submit', () => {

			test('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Delete my data'));

			test.describe('error', () => {

				test('shows error', async ({ page, account }) => {
					await page.locator('#password').fill(account.password);
					await page.locator('#confirm').fill(Math.random().toString().slice(2));
					await page.locator('input[type="submit"]').click();

					await expect(page.locator('flash.error')).toBeVisible();
					expect(page.locator('flash.error')).toHaveText('Confirmation incorrect');
				});
				
			});

			test('success', async ({ page, account }) => {
				await page.locator('#password').fill(account.password);
				await page.locator('#confirm').fill('CONFIRM');
				await page.locator('input[type="submit"]').click();

				await expect(page).toHaveURL(/\//);
			});
			
		});
		
	});

});
