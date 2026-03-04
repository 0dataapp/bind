import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

const _load = load({});

test.describe('account', () => {

  test.beforeEach(({ page }) => page.goto('/account'));

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
    });

    sessionTest.describe('title', () => {

      sessionTest('head', async ({ page }) => expect(await page.title()).toEqual(_load.title));

      sessionTest('h1', ({ page }) => expect(page.locator('h1')).toHaveText(_load.title));
      
    });

    sessionTest('username', ({ page }) => expect(page.locator('a[href="/account/username"]')).toHaveText('Change username'));

    sessionTest('password', ({ page }) => expect(page.locator('a[href="/account/password"]')).toHaveText('Change password'));

    sessionTest('delete', ({ page }) => expect(page.locator('a[href="/account/delete"]')).toHaveText('Delete account'));
    
  });

});
