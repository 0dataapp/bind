import { test, expect } from '@playwright/test';
import { props } from './props.js';

test.describe('home', () => {

  test.beforeEach(({ page }) => page.goto('/'));

  test.describe('title', () => {

    test('head', async ({ page }) => expect(await page.title()).toEqual(props.title));

    test('h1', ({ page }) => expect(page.locator('h1')).toHaveText(props.title));
    
  });

  test.describe('login', () => {

    test('links to page', ({ page }) => expect(page.locator('a.login')).toHaveAttribute('href', '/login'));

    test('text', ({ page }) => expect(page.locator('a.login')).toHaveText('Sign in'));
    
  });

  test.describe('docs', () => {

    test('href', ({ page }) => expect(page.locator('a.docs')).toHaveAttribute('href', 'https://bind.0data.app'));
    
    test('rel', ({ page }) => expect(page.locator('a.docs')).toHaveAttribute('rel', 'noreferrer'));

    test('target', ({ page }) => expect(page.locator('a.docs')).toHaveAttribute('target', '_blank'));

    test('text', ({ page }) => expect(page.locator('a.docs')).toHaveText('Learn more'));
    
  });

});
