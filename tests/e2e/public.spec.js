import { expect, test } from '@playwright/test';
import { collectCriticalConsole, expectNoCriticalConsole } from './helpers';

test.describe('public smoke tests', () => {
  for (const route of ['/', '/catalogo', '/favoritos', '/vender']) {
    test(`${route} renders without critical errors`, async ({ page }) => {
      const consoleMessages = collectCriticalConsole(page);

      await page.goto(route);
      await expect(page.locator('body')).not.toContainText('404: NOT_FOUND');
      await expect(page.locator('body')).not.toContainText('Application error');
      await expect(page.getByText(/AutosTandil/i).first()).toBeVisible();

      await expectNoCriticalConsole(consoleMessages);
    });
  }

  test('catalog shows search, filters area and car cards when data is available', async ({ page }) => {
    await page.goto('/catalogo');

    await expect(page.getByPlaceholder(/marca, modelo/i).first()).toBeVisible();
    await expect(page.getByTestId('catalog-grid')).toBeVisible();
    await expect(page.getByTestId('car-card').first()).toBeVisible();
  });

  test('favorites shows controlled empty state', async ({ page }) => {
    await page.goto('/favoritos');

    await expect(page.getByText(/Aun no guardaste autos|Aún no guardaste autos/i)).toBeVisible();
  });

  test('sell page shows consignment CTA', async ({ page }) => {
    await page.goto('/vender');

    await expect(page.getByText(/consignaci/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /whatsapp|contactar|quiero/i }).first()).toBeVisible();
  });

  test('catalog card opens detail with gallery and WhatsApp CTA', async ({ page }) => {
    await page.goto('/catalogo');

    await page.getByTestId('car-card').first().click();
    await expect(page).toHaveURL(/\/auto\//);
    await expect(page.locator('h1').first()).toBeVisible();
    await expect(page.getByText(/\$\s?/).first()).toBeVisible();

    const whatsapp = page.locator('[data-testid="whatsapp-cta"]:visible').first();
    await expect(whatsapp).toBeVisible();
    await expect(whatsapp).toHaveAttribute('href', /wa\.me\/5492494621182/);
    await expect(page.locator('img').first()).toBeVisible();
  });

  test('detail route starts at top after navigating from scrolled catalog', async ({ page }) => {
    await page.goto('/catalogo');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId('car-card').first().click();
    await expect(page).toHaveURL(/\/auto\//);
    await page.waitForFunction(() => window.scrollY === 0);
  });
});
