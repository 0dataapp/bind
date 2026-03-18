import { expect, test } from '@playwright/test';

test.describe('sample-app', () => {

  test.beforeEach(({ page }) => page.goto('/sample-app'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('sample-app'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('sample-app'));
    
  });

  test('button', ({ page }) => expect(page.locator('a[role="button"]')).toHaveText('Authorize'));

});
