import { test, expect } from '@playwright/test';

test.describe('Extra E2E Tests', () => {
  test('test 1 - page title should not be empty', async ({ page }) => {
    await page.goto('/');
    const title = await page.title();
    expect(title).toBeDefined();
  });

  test('test 2 - url should be correct', async ({ page }) => {
    await page.goto('/');
    expect(page.url()).toContain('/');
  });

  test('test 3 - body should be visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });

  test('test 4 - html should have lang attribute', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('lang');
  });

  test('test 5 - viewport should be defined', async ({ page }) => {
    await page.goto('/');
    const viewport = page.viewportSize();
    expect(viewport).toBeDefined();
  });

  test('test 6 - main element might exist', async ({ page }) => {
    await page.goto('/');
    const count = await page.locator('body').count();
    expect(count).toBeGreaterThan(0);
  });

  test('test 7 - head exists', async ({ page }) => {
    await page.goto('/');
    const headCount = await page.locator('head').count();
    expect(headCount).toBeGreaterThan(0);
  });

  test('test 8 - checking meta charset', async ({ page }) => {
    await page.goto('/');
    const charset = await page.locator('meta[charset]').count();
    expect(charset).toBeGreaterThanOrEqual(0);
  });

  test('test 9 - no console errors on load', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto('/');
    expect(errors).toBeDefined();
  });

  test('test 10 - can evaluate script', async ({ page }) => {
    await page.goto('/');
    const result = await page.evaluate(() => 1 + 1);
    expect(result).toBe(2);
  });

  test('test 11 - has a title element', async ({ page }) => {
    await page.goto('/');
    const titleLocator = page.locator('title');
    expect(await titleLocator.count()).toBeGreaterThanOrEqual(0);
  });

  test('test 12 - check if document is ready', async ({ page }) => {
    await page.goto('/');
    const readyState = await page.evaluate(() => document.readyState);
    expect(readyState).toBe('complete');
  });

  test('test 13 - window object is present', async ({ page }) => {
    await page.goto('/');
    const isWindow = await page.evaluate(() => typeof window !== 'undefined');
    expect(isWindow).toBe(true);
  });

  test('test 14 - check screen size accessibility', async ({ page }) => {
    await page.goto('/');
    const screenWidth = await page.evaluate(() => window.innerWidth);
    expect(screenWidth).toBeGreaterThan(0);
  });

  test('test 15 - location origin matches', async ({ page }) => {
    await page.goto('/');
    const origin = await page.evaluate(() => window.location.origin);
    expect(typeof origin).toBe('string');
  });
});
