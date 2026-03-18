import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

const test = stub.signedIn('/admin');

test('default', ({ page }) => expect(page.locator('h1:nth-of-type(2)')).toHaveText('404'));

// test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Admin'));

// test.describe('title', () => {

//   test('head', async ({ page }) => expect(await page.title()).toEqual('Admin'));

//   test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Admin'));
  
// });
