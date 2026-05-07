import { expect } from '@playwright/test';

export function collectCriticalConsole(page) {
  const messages = [];
  page.on('console', (message) => {
    if (message.type() === 'error') messages.push(message.text());
  });
  page.on('pageerror', (error) => {
    messages.push(error.message);
  });
  return messages;
}

export async function expectNoCriticalConsole(messages) {
  const allowed = [
    'Failed to load resource',
    'net::ERR_ABORTED',
    'net::ERR_BLOCKED_BY_CLIENT',
  ];
  const critical = messages.filter(message => !allowed.some(item => message.includes(item)));
  expect(critical).toEqual([]);
}

export async function loginAdmin(page) {
  await page.goto('/admin/login');
  await expect(page.getByTestId('admin-login-form')).toBeVisible();
  await page.locator('input[name="user"]').fill(process.env.VITE_ADMIN_USER || 'admin');
  await page.locator('input[name="password"]').fill(process.env.VITE_ADMIN_PASSWORD || 'admin');
  await page.getByRole('button', { name: /entrar/i }).click();
  await expect(page.getByTestId('admin-car-form')).toBeVisible();
}
