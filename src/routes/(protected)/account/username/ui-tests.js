import { test, expect } from '@playwright/test';
import { load } from './+page.js';

test.describe('username', () => {

  test.beforeEach(({ page }) => page.goto('/account/username'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
    
  });

  test.describe('form', () => {

  	test.describe('username', () => {

  		test('label', ({ page }) => expect(page.locator('label[for="username"]')).toHaveText('New username'));

  		test.describe('input', () => {

  			test('type', ({ page }) => expect(page.locator('#username')).toHaveAttribute('type', 'text'));

  			test('placeholder', ({ page }) => expect(page.locator('#username')).toHaveAttribute('placeholder', '…'));

  			test('required', ({ page }) => expect(page.locator('#username')).toHaveAttribute('required', ''));

  			test('autofocus', ({ page }) => expect(page.locator('#username')).toHaveAttribute('autofocus', ''));

  		});
  		
  	});

  	test.describe('submit', () => {

  		test('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

  		test.describe('error', () => {

  			test('shows error', async ({ page }) => {
  				await page.locator('#username').fill(Math.random().toString().split('.').join(' '));
  				await page.locator('input[type="submit"]').click();

  				await expect(page.locator('flash.error')).toBeVisible();
  				expect(page.locator('flash.error')).toHaveText('Username is invalid');
  			});
  			
  		});

  		test('success', async ({ page }) => {
  			await page.locator('#username').fill(Math.random().toString());
  			await page.locator('input[type="submit"]').click();

  			await expect(page.locator('flash.success')).toBeVisible();
  			expect(page.locator('flash.success')).toHaveText('Username changed');
  		});
  		
  	});
  	
  });

});
