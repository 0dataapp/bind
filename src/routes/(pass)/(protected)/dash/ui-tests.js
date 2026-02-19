import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '../../stub.js';

const _load = load({});

test.describe('dash', () => {

  test.beforeEach(({ page }) => page.goto('/dash'));

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

    sessionTest.skip('account', ({ page, account }) => expect(page.locator('.account')).toHaveText(account.email));

    sessionTest.describe('logout', () => {

      sessionTest('text', ({ page }) => expect(page.locator('a[href="/logout"]')).toHaveText('Sign out'));

      sessionTest('success', async ({ page }) => {
        await page.locator('a[href="/logout"]').click();

        await expect(page).not.toHaveURL(/\/dash/);

        expect(new URL(await page.url()).pathname).toBe('/');

        await page.goto('/dash');

        await expect(page).toHaveURL(/\/login/)
      });
      
    });
    
  });

});
