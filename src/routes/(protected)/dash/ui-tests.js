import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

import { load } from './+page.js';
const _load = load({});

const test = stub.signedIn('/dash');

test.describe('dash', () => {

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(_load.title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(_load.title));
    
  });

  test('sources', ({ page }) => expect(page.locator('a[href="/sources"]')).toHaveText('Data sources'));

  test('connected', ({ page }) => expect(page.locator('a[href="/connected"]')).toHaveText('Connected apps'));

  test('account', ({ page }) => expect(page.locator('a[href="/account"]')).toHaveText('Account'));

});
