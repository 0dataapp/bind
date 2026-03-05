import { test, expect } from '@playwright/test';
import stub from '$lib/stub.js';

test.describe('connected', () => {

  test.beforeEach(({ page }) => page.goto('/connected'));

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

      await page.goto('/connected');
    });

    sessionTest.describe('form', () => {

      sessionTest.describe('submit', () => {

        sessionTest('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Revoke access'));
        
      });
      
    });
    
  });

});
