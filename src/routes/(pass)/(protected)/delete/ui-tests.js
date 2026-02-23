import { test, expect } from '@playwright/test';
import { load } from './+page.server.js';
import stub from '../../../lib/stub.js';

const _load = load({});

test.describe('password', () => {

  test.beforeEach(({ page }) => page.goto('/password'));

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

      sessionTest.describe('password', () => {

        sessionTest('label', ({ page }) => expect(page.locator('label[for="password"]')).toHaveText('Current password'));

        sessionTest.describe('input', () => {

          sessionTest('type', ({ page }) => expect(page.locator('#password')).toHaveAttribute('type', 'password'));

          sessionTest('placeholder', ({ page }) => expect(page.locator('#password')).toHaveAttribute('placeholder', '…'));

          sessionTest('required', ({ page }) => expect(page.locator('#password')).toHaveAttribute('required', ''));

        });
        
      });

      sessionTest.describe('confirmPassword', () => {

        sessionTest('label', ({ page }) => expect(page.locator('label[for="confirmPassword"]')).toHaveText('Confirm password'));

        sessionTest.describe('input', () => {

          sessionTest('type', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password'));

          sessionTest('placeholder', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('placeholder', '…'));

          sessionTest('required', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('required', ''));

        });
        
      });

      sessionTest.describe('submit', () => {

        sessionTest('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Delete my data'));

        sessionTest.describe('error', () => {

          sessionTest('shows error', async ({ page }) => {
            await page.locator('#password').fill(account.password);
            await page.locator('#confirmPassword').fill(Math.random().toString().slice(2));
            await page.locator('input[type="submit"]').click();

            expect(page.locator('error')).toHaveText('Passwords should match');
          });
          
        });

        sessionTest('success', async ({ page }) => {
          await page.locator('#password').fill(account.password);
          await page.locator('#confirmPassword').fill(account.password);
          await page.locator('input[type="submit"]').click();

          await expect(page).toHaveURL(/\//);
        });
        
      });
      
    });
    
  });

});
