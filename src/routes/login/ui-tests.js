import { test, expect } from '@playwright/test';
import data from './data.js';
import stub from '$lib/stub.js';

test.describe('signin', () => {

  test.beforeEach(({ page }) => page.goto('/login'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(data.title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(data.title));
    
  });

  test.describe('form', () => {

    test('fail', async ({ page }) => {
      await page.locator('#emailOrHandle').fill(stub.email());
      await page.locator('#password').fill(Math.random().toString());
      await page.locator('input[type="submit"]').click();

      await expect(page.locator('flash.error')).toBeVisible();
      expect(page.locator('flash.error')).toHaveText('Invalid email or password');
    });

    test('success', async ({ page }) => {
      await page.goto('/signup');

      const account = stub.account();

      await page.locator('#email').fill(account.email);
      await page.locator('#password').fill(account.password);
      await page.locator('input[type="submit"]').click();

      await expect(page).toHaveURL(/\/dash/);

      await page.locator('a[href="/logout"]').click();

      await expect(page).not.toHaveURL(/\/dash/);

      await page.goto('/dash');
      await page.locator('#emailOrHandle').fill(account.email);
      await page.locator('#password').fill(account.password);
      await page.locator('input[type="submit"]').click();

      await expect(page).toHaveURL(/\/dash/);
    });
    
  });

  test.describe('signup', () => {

    test('links to page', ({ page }) => expect(page.locator('a.signup')).toHaveAttribute('href', '/signup'));

    test('text', ({ page }) => expect(page.locator('a.signup')).toHaveText('Create account'));
    
  });

});
