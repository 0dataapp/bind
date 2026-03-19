import { expect } from '@playwright/test';
import stub from '$lib/stub.js';

import fs from 'fs';
import path from 'path';

const test = stub.signedIn('/admin/settings');

test('default', ({ page }) => expect(page.locator('h1:nth-of-type(2)')).toHaveText('404'));

test.describe('mockAdmin', () => {

  test.beforeEach(({ page }) => page.goto('/admin/settings?test=mockAdmin'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Settings'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Settings'));
    
  });

  test.describe('disable_signups', () => {

    // test.beforeAll(async () => {
    //   const dirPath = path.join(process.cwd(), '__playwright/__db');
    //   if (fs.existsSync(dirPath))
    //     fs.rmSync(dirPath, { recursive: true, force: true });
    // });

    test('label', ({ page }) => expect(page.locator('label[for="disable_signups"]')).toHaveText('Disable signups'));

    test('input', ({ page }) => expect(page.locator('input[type="checkbox"]')).toHaveAttribute('name', 'disable_signups'));

    // test('check', async ({ page }) => {
    //   const isChecked = await page.locator('#disable_signups').isChecked();

    //   if (!isChecked)
    //     await page.locator('#disable_signups').check();

    //   await page.locator('input[type="submit"]').click();

    //   await expect(page.locator('flash.success')).toBeVisible();
    //   expect(page.locator('flash.success')).toHaveText('Settings updated');
    //   await expect(page.locator('#disable_signups')).toBeChecked();

    //   await page.goto('/logout');

    //   await page.goto('/login');
    //   expect(await page.locator('a.signup')).toBeHidden();

    //   await page.goto('/signup');
    //   await expect(page).toHaveURL(/\/login/);
    // });

    // test('uncheck', async ({ page }) => {
    //   const isChecked = await page.locator('#disable_signups').isChecked();

    //   if (isChecked)
    //     await page.locator('#disable_signups').uncheck();

    //   await page.locator('input[type="submit"]').click();

    //   await expect(page.locator('flash.success')).toBeVisible();
    //   expect(page.locator('flash.success')).toHaveText('Settings updated');
    //   await expect(page.locator('#disable_signups')).not.toBeChecked();

    //   await page.goto('/logout');

    //   await page.goto('/login');
    //   expect(await page.locator('a.signup')).toBeVisible();

    //   await page.goto('/signup');
    //   await expect(page.locator('h1')).toHaveText('Create account');
    // });
    
  });

  test('continue', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

});
