import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '../../../lib/stub.js';

const _load = load({});

test.describe('username', () => {

  test.beforeEach(({ page }) => page.goto('/username'));

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

    sessionTest.describe('form', () => {

      sessionTest.describe('username', () => {

        sessionTest('label', ({ page }) => expect(page.locator('label[for="username"]')).toHaveText('New username'));

        sessionTest.describe('input', () => {

          sessionTest('type', ({ page }) => expect(page.locator('#username')).toHaveAttribute('type', 'text'));

          sessionTest('placeholder', ({ page }) => expect(page.locator('#username')).toHaveAttribute('placeholder', '…'));

          sessionTest('required', ({ page }) => expect(page.locator('#username')).toHaveAttribute('required', ''));

          sessionTest('autofocus', ({ page }) => expect(page.locator('#username')).toHaveAttribute('autofocus', ''));

        });
        
      });

      sessionTest.describe('submit', () => {

        sessionTest('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

        sessionTest.describe('error', () => {

          sessionTest('shows error', async ({ page }) => {
            await page.locator('#username').fill(Math.random().toString().split('.').join(' '));
            await page.locator('input[type="submit"]').click();

            expect(page.locator('error')).toHaveText('Invalid username');
          });
          
        });

        sessionTest('success', async ({ page }) => {
          await page.locator('#username').fill(Math.random().toString());
          await page.locator('input[type="submit"]').click();

          await expect(page).toHaveURL(/\/dash/);
        });
        
      });

      sessionTest('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));
      
    });
    
  });

});
