import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './playwright/.results',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  timeout: 60_000,
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
      command: 'ffc mock-server --preset=fusion ./mocks --port 4012 --seed 42',
      url: 'http://localhost:4012/@fusion-mock/discovery',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'ffc app build && ffc app serve --port 3020 --mock http://localhost:4012',
      // The SPA HTML fallback requires Accept: text/html; probe its bootstrap module instead.
      url: 'http://localhost:3020/@fusion-spa-bootstrap.js',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3020',
    colorScheme: 'light',
    viewport: { width: 1280, height: 720 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
});
