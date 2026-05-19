import { expect, test } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

test('vercel.json contains SPA rewrite', async () => {
  const file = path.resolve('vercel.json');
  expect(fs.existsSync(file)).toBe(true);

  const config = JSON.parse(fs.readFileSync(file, 'utf8'));
  // El rewrite SPA debe enviar TODA ruta no-API a index.html
  const spaRewrite = config.rewrites.find(r => r.destination === '/index.html');
  expect(spaRewrite).toBeTruthy();
  expect(spaRewrite.source).toMatch(/^\/.*\.\*\)?$/);
});

test.describe('direct SPA routes', () => {
  for (const route of ['/admin', '/admin/login', '/admin/autos', '/admin/autos/nuevo', '/admin/analytics', '/catalogo', '/favoritos', '/vender', '/subastas']) {
    test(`${route} is handled by the app`, async ({ page }) => {
      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('404: NOT_FOUND');
      await expect(page.locator('body')).not.toContainText('Vercel');
      await expect(page.locator('body')).not.toContainText('Cannot GET');
      await expect(page.locator('body')).toBeVisible();
    });
  }
});
