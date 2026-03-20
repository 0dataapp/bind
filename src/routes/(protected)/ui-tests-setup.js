import { test, expect } from '@playwright/test';

import stub from '$lib/stub.js';
import { STORAGE_STATE } from '../../../playwright.config.js';
import fs from 'fs';

test('setup', async ({ page }) => {
  const account = stub.account();

  await page.goto('/signup');

  await page.locator('#email').fill(account.email);
  await page.locator('#password').fill(account.password);
  await page.locator('input[type="submit"]').click();

  await expect(page).toHaveURL(/\/dash/);

  await page.context().storageState({ path: STORAGE_STATE });
  fs.writeFileSync(process.env.ACCOUNT_DATA, JSON.stringify(Object.assign(account, {
    address: await page.locator('.address').textContent(),
  })));
});
