import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './playwright/.results',
  snapshotPathTemplate: '{testDir}/{testFilePath}-snapshots/{arg}{ext}',
  fullyParallel: true,
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
      port: 3010,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3010',
    colorScheme: 'light',
    viewport: { width: 1280, height: 720 },
  },
});
