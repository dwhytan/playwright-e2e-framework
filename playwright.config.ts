import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  // The trains page can take several seconds to show its results, so assertions wait longer than the default 5 s
  expect: { timeout: 15000 },
  // PeruRail is a production system: run one test at a time to keep our traffic to a minimum
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [
    ['html'],
    ['list'],
    ['allure-playwright', { outputFolder: 'allure-results' }]
  ],
  use: {
    baseURL: 'https://book.perurail.com',
    // Dates on PeruRail follow Peru's time zone, wherever the tests run
    timezoneId: 'America/Lima',
    trace: 'retain-on-first-failure',
    screenshot: 'on-first-failure',
    video: 'retain-on-first-failure',
  },
  // No Chromium project: PeruRail's bot protection denies automated Chromium,
  // and we respect that instead of trying to get around it
  projects: [
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});