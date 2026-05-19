import { expect, test } from '@playwright/test';
import { collectCriticalConsole, expectNoCriticalConsole } from './helpers';

test.describe('public smoke tests', () => {
  for (const route of ['/', '/catalogo', '/favoritos', '/vender', '/subastas', '/subastas/panel']) {
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

    await expect(page.getByPlaceholder(/marca, modelo/i)).toBeVisible();
    await expect(page.getByTestId('catalog-grid')).toBeVisible();
    await expect(page.getByTestId('car-card').first()).toBeVisible();
  });

  test('favorites shows controlled empty state', async ({ page }) => {
    await page.goto('/favoritos');

    await expect(page.getByText(/Aun no guardaste autos|Aún no guardaste autos/i)).toBeVisible();
  });

  test('car photos show a loading treatment while image requests are slow', async ({ page }) => {
    await page.route('**/*', async (route) => {
      if (route.request().resourceType() === 'image') {
        await new Promise(resolve => setTimeout(resolve, 700));
      }
      await route.continue();
    });

    await page.goto('/catalogo', { waitUntil: 'domcontentloaded' });

    await expect(page.locator('.at-image-loading').first()).toBeVisible();
  });

  test('sell page shows consignment CTA', async ({ page }) => {
    await page.goto('/vender');

    await expect(page.getByText(/consignaci/i).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /whatsapp|contactar|quiero/i }).first()).toBeVisible();
  });

  test('auctions page renders fallback lots or controlled empty state', async ({ page }) => {
    await page.goto('/subastas');

    await expect(page.getByText(/Subastas/i).first()).toBeVisible();
    await expect(page.locator('body')).not.toContainText('404: NOT_FOUND');
    await expect(page.locator('body')).not.toContainText('Application error');
  });

  test('auction signup asks for identity document and redirects back to auctions', async ({ page }) => {
    await page.goto('/subastas');

    await page.getByRole('button', { name: /ingresar/i }).click();
    await page.getByRole('button', { name: 'Crear cuenta', exact: true }).click();

    await expect(page.getByText(/documento/i)).toBeVisible();
    await expect(page.getByText(/tel[eé]fono/i)).toBeVisible();
    await expect(page.getByText(/nombre y apellido/i)).toBeVisible();
  });

  test('auction login includes account recovery flow', async ({ page }) => {
    await page.goto('/subastas/panel');

    await page.getByRole('button', { name: /^ingresar$/i }).click();
    await page.getByRole('button', { name: /olvid[eé] mi contrase/i }).click();

    await expect(page.getByRole('heading', { name: /recuperar cuenta/i })).toBeVisible();
    await expect(page.getByText(/link seguro/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /recuperar cuenta/i })).toBeVisible();
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

    await page.locator('[data-testid="detail-main-image"]:visible').first().click();
    await expect(page.getByTestId('image-lightbox')).toBeVisible();
    await page.getByRole('button', { name: /cerrar/i }).click();
    await expect(page.getByTestId('image-lightbox')).toHaveCount(0);

    await whatsapp.click();
  });

  test('home logo is visible', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByTestId('app-logo').first()).toBeVisible();
  });

  test('detail route starts at top after navigating from scrolled catalog', async ({ page }) => {
    await page.goto('/catalogo');
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.getByTestId('car-card').first().click();
    await expect(page).toHaveURL(/\/auto\//);
    await page.waitForFunction(() => window.scrollY === 0);
  });

  test('mobile image lightbox uses gestures without previous or next buttons', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/catalogo');
    await page.getByTestId('car-card').first().click();
    await expect(page).toHaveURL(/\/auto\//);

    await page.locator('[data-testid="detail-main-image"]:visible').first().click();
    await expect(page.getByTestId('image-lightbox')).toBeVisible();
    await expect(page.getByRole('button', { name: /anterior/i })).toHaveCount(0);
    await expect(page.getByRole('button', { name: /siguiente/i })).toHaveCount(0);
  });
});
