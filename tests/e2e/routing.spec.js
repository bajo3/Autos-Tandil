import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('vercel.json contains SPA rewrite', async () => {
  const file = path.resolve('vercel.json');
  expect(fs.existsSync(file)).toBe(true);

  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  expect(config.rewrites).toContainEqual({
    source: '/(.*)',
    destination: '/index.html',
  });
});

test.describe('direct SPA routes', () => {
  for (const route of ['/admin', '/admin/login', '/admin/autos', '/admin/autos/nuevo', '/admin/analytics', '/catalogo', '/favoritos', '/vender']) {
    test(`${route} is handled by the app`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('404: NOT_FOUND');
      await expect(page.locator('body')).not.toContainText('Vercel');
      await expect(page.locator('body')).not.toContainText('Cannot GET');
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
