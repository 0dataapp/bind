import { test, expect } from '@playwright/test';
import { load } from './+page.server.js';
import stub from '$lib/stub.js';

const _load = params => load({
  data: {
    params: Object.assign({
      redirect_uri: stub.origin(),
      client_id: stub.origin(),
      scopes: stub.scope(),
    }, params),
  },
});

test.describe('authorize', () => {

  test.beforeEach(({ page }) => page.goto('/authorize'));

  test('redirects to login', ({ page }) => expect(page).toHaveURL(/\/login/));

  test.describe('session', () => {

    const sessionTest = test.extend({
      account: ({ page }, use) => use(stub.account()),
    });

    sessionTest.beforeEach(async ({ page, account }) => {
      await page.goto('/signup');

      await page.locator('#email').fill(account.email);
      await page.locator('#password').fill(account.password);
      await page.locator('input[type="submit"]').click();

      await expect(page).toHaveURL(/\/dash/);

      await page.goto('/authorize');
    });

    sessionTest.describe('title', () => {

      sessionTest('head', async ({ page }) => expect(await page.title()).toEqual(_load().title));

      sessionTest('h1', ({ page }) => expect(page.locator('h1')).toHaveText(_load().title));
      
    });
    
  });

});
