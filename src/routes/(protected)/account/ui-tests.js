import { test, expect } from '@playwright/test';
import { load } from './+page.js';

test.describe('account', () => {

  test.beforeEach(({ page }) => page.goto('/account'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
    
  });

  test('password', ({ page }) => expect(page.locator('a[href="/account/password"]')).toHaveText('Change password'));

  test('username', ({ page }) => expect(page.locator('a[href="/account/username"]')).toHaveText('Change username'));

  test('delete', ({ page }) => expect(page.locator('a[href="/account/delete"]')).toHaveText('Delete account'));

});
