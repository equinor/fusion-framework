import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './playwright/.results',
  ignoreSnapshots: process.env.PLAYWRIGHT_IGNORE_SNAPSHOTS === 'true',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  // Avoid competing cold portal/app loads against the shared preview server.
  workers: 1,
  timeout: 45_000,
  reporter: [['list'], ['html', { open: 'never' }]],
  expect: {
    timeout: 15_000,
    toHaveScreenshot: {
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.03,
    },
  },
  webServer: [
    {
      command: 'ffc mock-server --preset=fusion ./mocks --port 4011 --seed 42',
      url: 'http://localhost:4011/@fusion-mock/discovery',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'ffc app build && ffc app serve --port 3010 --mock http://localhost:4011',
      // The SPA HTML fallback requires Accept: text/html; probe its bootstrap module instead.
      url: 'http://localhost:3010/@fusion-spa-bootstrap.js',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3010',
    colorScheme: 'light',
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
