import { expect } from '@playwright/test';
import stub from '$lib/stub.js';
const test = stub.signedIn2();

test.describe('dash', () => {

  test.beforeEach(({ page }) => page.goto('/dash'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Dashboard'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Dashboard'));
    
  });

  test('address', ({ page, account }) => expect(page.locator('.address')).toHaveText(account.address));

  test('sources', ({ page }) => expect(page.locator('a[href="/sources"]')).toHaveText('Data sources'));

  test('connected', ({ page }) => expect(page.locator('a[href="/connected"]')).toHaveText('Connected apps'));

  test('account', ({ page }) => expect(page.locator('a[href="/account"]')).toHaveText('Account'));

  test('footer', stub.signedIn3('/dash'));

});
