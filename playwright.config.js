import { defineConfig, devices } from '@playwright/test';

const port = process.env.PLAYWRIGHT_PORT || 5173;
const baseURL = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  expect: {
    timeout: 8_000,
  },
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL,
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host 127.0.0.1 --port ${port} --strictPort`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      ...process.env,
      VITE_ADMIN_USER: process.env.VITE_ADMIN_USER || 'admin',
      VITE_ADMIN_PASSWORD: process.env.VITE_ADMIN_PASSWORD || 'admin',
      VITE_WHATSAPP_NUMBER: process.env.VITE_WHATSAPP_NUMBER || '5492494621182',
    },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
