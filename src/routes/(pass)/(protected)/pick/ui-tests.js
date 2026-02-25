import { test, expect } from '@playwright/test';

test.describe('pick', () => {

  test.beforeEach(({ page }) => page.goto('/pick'));

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

      await page.goto('/pick');
    });

    sessionTest.describe('title', () => {

      sessionTest('head', async ({ page }) => expect(await page.title()).toEqual(load.title));

      sessionTest('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load.title));
      
    });
    
  });

});
