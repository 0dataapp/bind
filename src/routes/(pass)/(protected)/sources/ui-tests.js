import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

test.describe('sources', () => {

  test.beforeEach(({ page }) => page.goto('/sources'));

  test('redirects to login', ({ page }) => expect(page).toHaveURL(/\/login/));

  test.describe('session', () => {

    const sessionTest = test.extend({
      account: ({ page }, use) => use(stub.account()),
    });

    sessionTest.beforeEach(async ({ page, account }) => {
      await page.goto('/signup');

      await page.locator('#email').fill(account.email);
      await page.locator('#password').fill(account.password);
      await page.locator('input[type="submit"]').click();

      await expect(page).toHaveURL(/\/dash/);

      await page.goto('/sources');
    });

    sessionTest.describe('title', () => {

      sessionTest('head', async ({ page }) => expect(await page.title()).toEqual(load.title));

      sessionTest('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load.title));
      
    });

    sessionTest('github', ({ page }) => expect(page.locator('.github')).toHaveText('GitHub'));
    
  });

});
