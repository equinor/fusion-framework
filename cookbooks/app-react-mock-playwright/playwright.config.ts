import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './playwright/.results',
  fullyParallel: true,
  // All specs share one mock-server process, so a runtime override (see playwright-override.spec.ts)
  // would race other specs' assertions under parallel workers — keep this suite single-worker instead.
  workers: 1,
  // Browser assertions run against production-built files rather than Vite's development graph.
  expect: { timeout: 15_000 },
  webServer: [
    {
      command:
        'ffc mock-server ./mocks --host 127.0.0.1 --port 4010 --analytics-seed mocks/analytics.seed.jsonl',
      url: 'http://127.0.0.1:4010/@fusion-mock/discovery',
      reuseExistingServer: !process.env.CI,
    },
    {
      // Bind both servers and their clients to one address family on Windows.
      command:
        'ffc app build && ffc app serve --host 127.0.0.1 --port 3000 --mock http://127.0.0.1:4010',
      // Probe the bootstrap module without depending on the SPA HTML Accept header.
      url: 'http://127.0.0.1:3000/@fusion-spa-bootstrap.js',
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://127.0.0.1:3000',
  },
});
