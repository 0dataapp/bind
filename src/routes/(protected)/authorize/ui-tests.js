import { test, expect } from '@playwright/test';
import logic from './logic.js';

const client_id = `/sample-app?${ Math.random().toString() }`;
const folder = 'bind-sample-app';
const scope = folder + ':r';
const parsed = logic.parseScopes(scope)[0];

test.describe('account', () => {

  test.beforeEach(({ page }) => page.goto(`/authorize?${ new URLSearchParams({
    scope,
    response_type: 'token',
    client_id,
    redirect_uri: client_id,
  }) }`));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual('Authorize'));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Authorize'));
    
  });

  test('blurb', ({ page }) => expect(page.locator('p:nth-of-type(1)')).toHaveText(`The app at ${ client_id } would to like access:`));

  test('folder', ({ page }) => expect(page.locator('td:nth-child(1)')).toHaveText(parsed.name));

  test('permission', ({ page }) => expect(page.locator('td:nth-child(2)')).toHaveText(parsed.permissions));

  test.describe('source', () => {

    test('label', ({ page }) => expect(page.locator('label[for="_depot"]')).toHaveText('Data source:'));

    test.describe('select', () => {

      test('required', ({ page }) => expect(page.locator('select')).toHaveAttribute('required', ''));

      test('text', async ({ page }) => expect(await page.locator('select').evaluate(el => Array.from(el.options).map(opt => opt.textContent))).toEqual(['', 'This server']));
      
    });
    
  });

  test.describe('deny', () => {

    test('href', ({ page }) => expect(page.locator('input[type="submit"] + a')).toHaveAttribute('href', `${ client_id }#error=access_denied`));

    test('text', ({ page }) => expect(page.locator('input[type="submit"] + a')).toHaveText('Deny'));

  });

  test.describe('allow', () => {

    test('text', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveText('Allow'));

    test('click', async ({ page }) => {
      await page.locator('select').selectOption('local_custody');
      await page.locator('input[type="submit"]').click();
      await expect(page).toHaveURL(/\/sample-app/);
    });

  });

});
