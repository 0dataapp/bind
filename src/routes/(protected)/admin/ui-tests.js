import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

import { load } from './+page.js';

const test = stub.signedIn('/admin');

test.describe('admin', () => {

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
    
  });

});
