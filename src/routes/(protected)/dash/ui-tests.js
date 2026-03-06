import { test, expect } from '@playwright/test';
import stub from '$lib/stub.js';

import { load } from './+page.js';
const _load = load({});

test.describe('dash', () => {

  test.beforeEach(({ page }) => page.goto('/dash'));

  test('redirects to login', ({ page }) => expect(page).toHaveURL(/\/login/));

  test.describe('signedIn', () => {

    const signedIn = stub.signedIn();

    signedIn.describe('title', () => {

      signedIn('head', async ({ page }) => expect(await page.title()).toEqual(_load.title));

      signedIn('h1', ({ page }) => expect(page.locator('h1')).toHaveText(_load.title));
      
    });

    signedIn('sources', ({ page }) => expect(page.locator('a[href="/sources"]')).toHaveText('Data sources'));

    signedIn('connected', ({ page }) => expect(page.locator('a[href="/connected"]')).toHaveText('Connected apps'));

    signedIn('account', ({ page }) => expect(page.locator('a[href="/account"]')).toHaveText('Account'));

    signedIn('logout', ({ page }) => expect(page.locator('a[href="/logout"]')).toHaveText('Sign out'));
    
  });

});
