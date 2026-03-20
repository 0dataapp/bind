import { test, expect } from '@playwright/test';

test.describe('admin', () => {

  test('default', async ({ page }) => {
    await page.goto('/admin');
    expect(page.locator('h1:nth-of-type(2)')).toHaveText('404');
  });

  test.describe('mockAdmin', () => {

    test.beforeEach(({ page }) => page.goto('/admin?test=mockAdmin'));

    test.describe('title', () => {

      test('head', async ({ page }) => expect(await page.title()).toEqual('Admin'));

      test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Admin'));
      
    });

    test.describe('settings', () => {

      test('href', ({ page }) => expect(page.locator('a.settings')).toHaveAttribute('href', '/admin/settings'));
      
      test('text', ({ page }) => expect(page.locator('a.settings')).toHaveText('Settings'));
      
    });

  });

});
