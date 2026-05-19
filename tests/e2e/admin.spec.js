import { expect, test } from '@playwright/test';
import { loginAdmin } from './helpers';

test.describe('admin', () => {
  test('shows login when session is missing and allows logout', async ({ page }) => {
    await page.goto('/admin');
    await expect(page.getByTestId('admin-login-form')).toBeVisible();

    await page.locator('input[name="user"]').fill(process.env.VITE_ADMIN_USER || 'admin');
    await page.locator('input[name="password"]').fill(process.env.VITE_ADMIN_PASSWORD || 'admin');
    await page.getByRole('button', { name: /entrar/i }).click();
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-car-form')).toHaveCount(0);

    await page.getByRole('button', { name: /salir/i }).click();
    await expect(page.getByTestId('admin-login-form')).toBeVisible();
  });

  test('dashboard add button opens new car form', async ({ page }) => {
    await loginAdmin(page);

    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('admin-car-form')).toHaveCount(0);
    await page.getByTestId('admin-add-car').click();
    await expect(page).toHaveURL(/\/admin\/autos\/nuevo$/);
    await expect(page.getByTestId('admin-car-form')).toBeVisible();
  });

  test('ImageManager adds, promotes and deletes image URLs without Supabase writes', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/autos/nuevo');

    const manager = page.getByTestId('image-manager');
    await expect(manager).toBeVisible();
    await expect(page.getByTestId('image-upload-files')).toBeVisible();

    const urls = [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=900',
      'https://images.unsplash.com/photo-1542362567-b07e54358753?w=900',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?w=900',
    ];

    await page.getByTestId('image-add-url').fill(urls[0]);
    await page.getByRole('button', { name: /agregar foto/i }).click();

    await page.getByText(/Agregar varias URLs/i).click();
    await page.getByTestId('image-add-many').fill(`${urls[1]}\n${urls[2]}`);
    await page.getByRole('button', { name: /agregar lote/i }).click();

    await expect(page.getByTestId('image-card')).toHaveCount(3);
    await expect(page.getByTestId('image-card').first()).toContainText('Portada');
    await page.getByTestId('image-card').first().locator('button[aria-label^="Abrir imagen"]').click();
    await expect(page.getByTestId('image-lightbox')).toBeVisible();
    await page.getByRole('button', { name: /cerrar/i }).click();
    await expect(page.getByTestId('image-lightbox')).toHaveCount(0);

    await page.getByTestId('image-card').nth(1).getByTestId('image-set-cover').click();
    await expect(page.getByTestId('image-card').first()).toContainText('Portada');
    await expect(page.getByTestId('image-card').first()).toContainText(urls[1]);

    await page.getByTestId('image-card').first().getByTestId('image-delete').click();
    await expect(page.getByTestId('image-card')).toHaveCount(2);

    const saveButton = page.getByRole('button', { name: /guardar auto/i });
    if (await saveButton.isEnabled()) {
      test.info().annotations.push({
        type: 'note',
        description: 'Supabase env is configured; save button is enabled, but this test intentionally avoids DB writes.',
      });
    } else {
      await expect(saveButton).toBeDisabled();
    }
  });

  test('admin list renders fallback cars or Supabase cars', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/autos');

    await expect(page.getByTestId('admin-cars-list')).toBeVisible();
    await expect(page.getByText(/Autos publicados/i)).toBeVisible();
  });

  test('admin analytics route loads', async ({ page }) => {
    await loginAdmin(page);
    await page.goto('/admin/analytics');

    await expect(page.getByTestId('admin-analytics')).toBeVisible();
    await expect(page.getByText(/Analytics/i).first()).toBeVisible();
  });
});
