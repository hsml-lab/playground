import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173/playground/',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'desktop',
      testIgnore: /og-image/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1512, height: 982 },
        deviceScaleFactor: 2,
      },
    },
    {
      name: 'tablet',
      testIgnore: /og-image/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1194, height: 834 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'mobile',
      testIgnore: /og-image/,
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
      },
    },
    {
      name: 'og-image',
      testMatch: /og-image/,
      snapshotPathTemplate: '{snapshotDir}/{arg}{ext}',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1200, height: 630 },
      },
    },
  ],
  webServer: {
    command: 'pnpm run dev',
    url: 'http://localhost:5173/playground/',
    reuseExistingServer: !process.env.CI,
  },
});
