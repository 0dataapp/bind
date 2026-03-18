import { expect } from '@playwright/test';
import stub from '$lib/stub.js';
import { options } from '$lib/depot/options.js';

const test = stub.signedIn('/sources');

test.describe('title', () => {

  test('head', async ({ page }) => expect(await page.title()).toEqual('Data sources'));

  test('h1', ({ page }) => expect(page.locator('h1')).toHaveText('Data sources'));
  
});

test.describe('default', () => {

  test('blurb', ({ page }) => expect(page.locator('h1 + p')).toHaveText('No sources available.'));

  test('link', ({ page }) => expect(page.locator('h1 + p + p')).toHaveText('See documentation for integration options.'));

});

test.describe('mockAllAvailable', () => {

  test.beforeEach(({ page }) => page.goto('/sources?test=mockAllAvailable'));

  test('blurb', ({ page }) => expect(page.locator('h1 + p')).toBeHidden());

  test('link', ({ page }) => expect(page.locator('h1 + p + p')).toBeHidden());

  test('h4', ({ page }) => expect(page.locator('h4')).toHaveText('Link account'));

  Object.values(options).filter(e => e.meta.id !== 'local_custody').forEach((e, i) => {

    test(e.meta.id, ({ page }) => expect(page.locator(`.available button:nth-child(${ i + 1 })`)).toHaveText(e.meta.name));
  });

});

test.describe('mockAllLinked', () => {

  test.beforeEach(({ page }) => page.goto('/sources?test=mockAllLinked'));

  test('blurb', ({ page }) => expect(page.locator('h1 + p')).toBeHidden());

  test('link', ({ page }) => expect(page.locator('h1 + p + p')).toBeHidden());

  test('h4', ({ page }) => expect(page.locator('h4')).toHaveText('Connected'));

  Object.values(options).filter(e => e.meta.id !== 'local_custody').forEach((e, i) => {

    test.describe(e.meta.id, () => {

      test.describe('a', () => {

        test('href', ({ page }) => expect(page.locator(`li:nth-child(${ i + 1 }) a`)).toHaveAttribute('href', `/sources/${ e.meta.id }`));

        test('text', ({ page }) => expect(page.locator(`li:nth-child(${ i + 1 }) a`)).toHaveText(e.meta.name));

      });

    });
  });

});