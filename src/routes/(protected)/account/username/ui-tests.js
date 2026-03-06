import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

const startPage = ({ page }) => page.goto('/account/username');

test.describe('username', () => {

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

      signedIn.describe('username', () => {

        signedIn('label', ({ page }) => expect(page.locator('label[for="username"]')).toHaveText('New username'));

        signedIn.describe('input', () => {

          signedIn('type', ({ page }) => expect(page.locator('#username')).toHaveAttribute('type', 'text'));

          signedIn('placeholder', ({ page }) => expect(page.locator('#username')).toHaveAttribute('placeholder', '…'));

          signedIn('required', ({ page }) => expect(page.locator('#username')).toHaveAttribute('required', ''));

          signedIn('autofocus', ({ page }) => expect(page.locator('#username')).toHaveAttribute('autofocus', ''));

        });
        
      });

      signedIn.describe('submit', () => {

        signedIn('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

        signedIn.describe('error', () => {

          signedIn('shows error', async ({ page }) => {
            await page.locator('#username').fill(Math.random().toString().split('.').join(' '));
            await page.locator('input[type="submit"]').click();

            expect(page.locator('flash.error')).toHaveText('Username is invalid');
          });
          
        });

        signedIn('success', async ({ page }) => {
          await page.locator('#username').fill(Math.random().toString());
          await page.locator('input[type="submit"]').click();

            expect(page.locator('flash.success')).toHaveText('Username changed');
        });
        
      });

      signedIn('dash', ({ page }) => expect(page.locator('a[href="/dash"]')).toHaveText('Dashboard'));
      
    });
    
  });

});
