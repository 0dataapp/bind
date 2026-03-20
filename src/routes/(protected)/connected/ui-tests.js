import { test, expect } from '@playwright/test';
import stub from '$lib/stub.js';

test.describe('connected', () => {

  test.beforeEach(({ page }) => page.goto('/connected'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Connected apps'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Connected apps'));
    
  });

  test('default', ({ page }) => expect(page.locator('h1 + p')).toHaveText('No connected apps'));

  test.describe('authorize', () => {

    test.beforeEach(stub.authorizeApp);

    test('li', ({ page }) => expect(page.locator('li')).toHaveText('localhost:4173/sample-app'));
    
  });

});
