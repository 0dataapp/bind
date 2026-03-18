import { expect } from '@playwright/test';
import stub from '$lib/stub.js';
import util from '$lib/util.js';

const test = stub.signedIn('/connected');

const client_id = 'http://localhost:4173/sample-app';
const title = `Connection for ${ util.humanLink(client_id) }`;

test.beforeEach(async ({ page }) => {
  await stub.authorizeApp({ page });
  await page.locator('li a').click();
  await expect(page).toHaveURL(new RegExp(`${ util.hex.encode(client_id) }$`));
});

test.describe('title', () => {

  test('head', async ({ page }) => expect(await page.title()).toEqual(title));

  test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(title));
  
});

test('li', ({ page }) => expect(page.locator('li')).toHaveText('1 connections'));

test('revoke', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Revoke access'));
