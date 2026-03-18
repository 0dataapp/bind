import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

const test = stub.signedIn('/connected');

test.describe('connected', () => {

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Connected apps'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Connected apps'));
    
  });

  test('default', ({ page }) => expect(page.locator('h1 + p')).toHaveText('No connected apps'));

});
