import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

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

      sessionTest.describe('currentPassword', () => {

        sessionTest('label', ({ page }) => expect(page.locator('label[for="currentPassword"]')).toHaveText('Current password'));

        sessionTest.describe('input', () => {

          sessionTest('type', ({ page }) => expect(page.locator('#currentPassword')).toHaveAttribute('type', 'password'));

          sessionTest('placeholder', ({ page }) => expect(page.locator('#currentPassword')).toHaveAttribute('placeholder', '…'));

          sessionTest('required', ({ page }) => expect(page.locator('#currentPassword')).toHaveAttribute('required', ''));

        });
        
      });

      sessionTest.describe('newPassword', () => {

        sessionTest('label', ({ page }) => expect(page.locator('label[for="newPassword"]')).toHaveText('New password'));

        sessionTest.describe('input', () => {

          sessionTest('type', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('type', 'password'));

          sessionTest('placeholder', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('placeholder', '…'));

          sessionTest('required', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('required', ''));

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

        sessionTest('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

        sessionTest.describe('error', () => {

          sessionTest('shows error', async ({ page }) => {
            await page.locator('#oldPassword').fill(account.password);
            await page.locator('#newPassword').fill(Math.random().toString().slice(2));
            await page.locator('#confirmPassword').fill(Math.random().toString().slice(2));
            await page.locator('input[type="submit"]').click();

            expect(page.locator('error')).toHaveText('New password should match confirmation');
          });
          
        });

        sessionTest('success', async ({ page }) => {
          const newPassword = Math.random().toString().slice(2);
          await page.locator('#oldPassword').fill(account.password);
          await page.locator('#newPassword').fill(newPassword);
          await page.locator('#confirmPassword').fill(newPassword);
          await page.locator('input[type="submit"]').click();

          await expect(page).toHaveURL(/\/dash/);
        });
        
      });

      sessionTest('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));
      
    });
    
  });

});
