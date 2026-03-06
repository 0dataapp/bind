import { test, expect } from '@playwright/test';
import { load } from './+page.js';
import stub from '$lib/stub.js';

test.describe('signup', () => {

  test.beforeEach(({ page }) => page.goto('/signup'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(load().title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(load().title));
    
  });

  test.describe('form', () => {

    test.describe('email', () => {

      test('label', ({ page }) => expect(page.locator('label[for="email"]')).toHaveText('Email'));

      test.describe('input', () => {

        test('type', ({ page }) => expect(page.locator('#email')).toHaveAttribute('type', 'email'));

        test('placeholder', ({ page }) => expect(page.locator('#email')).toHaveAttribute('placeholder', 'me@example.com'));

        test('required', ({ page }) => expect(page.locator('#email')).toHaveAttribute('required', ''));

      });
      
    });

    test.describe('password', () => {

      test('label', ({ page }) => expect(page.locator('label[for="password"]')).toHaveText('Password'));

      test.describe('input', () => {

        test('type', ({ page }) => expect(page.locator('#password')).toHaveAttribute('type', 'password'));

        test('placeholder', ({ page }) => expect(page.locator('#password')).toHaveAttribute('placeholder', '…'));

        test('required', ({ page }) => expect(page.locator('#password')).toHaveAttribute('required', ''));

      });
      
    });

    test.describe('submit', () => {

      test('value', ({ page }) => expect(page.locator('input[type="submit"]')).toHaveAttribute('value', 'Continue'));

      test.describe('error', () => {

        test('shows error', async ({ page }) => {
          await page.locator('#email').fill(stub.email());
          await page.locator('#password').fill(Math.random().toString().slice(-4));
          await page.locator('input[type="submit"]').click();

          expect(page.locator('flash.error')).toBeVisible();
          expect(page.locator('flash.error')).toHaveText('Password too short');
        });
        
      });

      test('success', async ({ page }) => {
        await page.locator('#email').fill(stub.email());
        await page.locator('#password').fill(Math.random().toString());
        await page.locator('input[type="submit"]').click();

        await expect(page).toHaveURL(/\/dash/);
      });
      
    });
    
  });

  test.describe('login', () => {

    test('links to page', ({ page }) => expect(page.locator('a.login')).toHaveAttribute('href', '/login'));

    test('text', ({ page }) => expect(page.locator('a.login')).toHaveText('Sign in'));
    
  });

});
