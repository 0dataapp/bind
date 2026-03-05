import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

const startPage = ({ page }) => page.goto('/account');

test.describe('account', () => {

  test.beforeEach(startPage);

  test('redirects to login', ({ page }) => expect(page).toHaveURL(/\/login/));

  test.describe('signedIn', () => {

    const signedIn = stub.signedIn();

    signedIn.beforeEach(startPage);

    signedIn.describe('title', () => {

      signedIn('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

      signedIn('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
      
    });

    signedIn('password', ({ page }) => expect(page.locator('a[href="/account/password"]')).toHaveText('Change password'));

    signedIn('username', ({ page }) => expect(page.locator('a[href="/account/username"]')).toHaveText('Change username'));

    signedIn('delete', ({ page }) => expect(page.locator('a[href="/account/delete"]')).toHaveText('Delete account'));
    
  });

});
