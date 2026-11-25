import { defineConfig, devices } from '@playwright/test';

/**
 * Kōshi Playwright Configuration
 * Milestone 2: Test Infrastructure & Fixture Setup
 *
 * Verifies layout geometry across Chromium, Firefox, and WebKit
 * using isolated static HTML fixtures loaded via a zero-dependency local HTTP server.
 */
export default defineConfig({
  testDir: './tests/e2e',
  testMatch: '**/*.spec.ts',
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['list']],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    viewport: { width: 1280, height: 720 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'node tests/e2e/server.mjs',
    url: 'http://127.0.0.1:4173/harness.html',
    reuseExistingServer: !process.env.CI,
    timeout: 10_000,
  },
});
