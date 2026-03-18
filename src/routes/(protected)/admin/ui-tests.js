import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

const test = stub.signedIn('/admin');

test.describe('admin', () => {

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Admin'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Admin'));
    
  });

});
