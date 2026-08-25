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
      command: 'ffc mock-server ./mocks --port 4010',
      url: 'http://localhost:4010/@fusion-mock/discovery',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'ffc app build && ffc app serve --port 3000 --mock http://localhost:4010',
      // checked by TCP connect only — the dev server's SPA fallback only responds to
      // requests with an `Accept: text/html` header, which a plain readiness probe omits
      port: 3000,
      timeout: 120_000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
});
