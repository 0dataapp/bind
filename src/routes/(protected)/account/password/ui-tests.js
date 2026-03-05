import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

const startPage = ({ page }) => page.goto('/account/password');

test.describe('password', () => {

  test.beforeEach(startPage);

  test('redirects to login', ({ page }) => expect(page).toHaveURL(/\/login/));

  test.describe('signedIn', () => {

    const signedIn = stub.signedIn();

    signedIn.beforeEach(startPage);

    signedIn.describe('title', () => {

      signedIn('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

      signedIn('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
      
    });

    signedIn.describe('form', () => {

      signedIn.describe('oldPassword', () => {

        signedIn('label', ({ page }) => expect(page.locator('label[for="oldPassword"]')).toHaveText('Current password'));

        signedIn.describe('input', () => {

          signedIn('type', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('type', 'password'));

          signedIn('placeholder', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('placeholder', '…'));

          signedIn('required', ({ page }) => expect(page.locator('#oldPassword')).toHaveAttribute('required', ''));

        });
        
      });

      signedIn.describe('newPassword', () => {

        signedIn('label', ({ page }) => expect(page.locator('label[for="newPassword"]')).toHaveText('New password'));

        signedIn.describe('input', () => {

          signedIn('type', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('type', 'password'));

          signedIn('placeholder', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('placeholder', '…'));

          signedIn('required', ({ page }) => expect(page.locator('#newPassword')).toHaveAttribute('required', ''));

        });
        
      });

      signedIn.describe('confirmPassword', () => {

        signedIn('label', ({ page }) => expect(page.locator('label[for="confirmPassword"]')).toHaveText('Confirm password'));

        signedIn.describe('input', () => {

          signedIn('type', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('type', 'password'));

          signedIn('placeholder', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('placeholder', '…'));

          signedIn('required', ({ page }) => expect(page.locator('#confirmPassword')).toHaveAttribute('required', ''));

        });
        
      });

      signedIn.describe('submit', () => {

        signedIn('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

        signedIn.describe('error', () => {

          signedIn('shows error', async ({ page, account }) => {
            await page.locator('#oldPassword').fill(account.password);
            await page.locator('#newPassword').fill(Math.random().toString().slice(2));
            await page.locator('#confirmPassword').fill(Math.random().toString().slice(2));
            await page.locator('input[type="submit"]').click();

            expect(page.locator('flash.error')).toHaveText('New password should match confirmation');
          });
          
        });

        signedIn.skip('success', async ({ page, account }) => {
          const newPassword = Math.random().toString().slice(2);
          await page.locator('#oldPassword').fill(account.password);
          await page.locator('#newPassword').fill(newPassword);
          await page.locator('#confirmPassword').fill(newPassword);
          await page.locator('input[type="submit"]').click();

          // expect(page).toHaveURL(/\/dash/);
          // #flake
          // why does the flash appear when we check that the page url changed?

          expect(page.locator('flash.success')).toHaveText('Password changed');
        });
        
      });

      signedIn('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));
      
    });
    
  });

});
