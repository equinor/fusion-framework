import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './playwright',
  outputDir: './playwright/.results',
  fullyParallel: true,
  // All specs share one mock-server process, so a runtime override (see playwright-override.spec.ts)
  // would race other specs' assertions under parallel workers — keep this suite single-worker instead.
  workers: 1,
  // The first browser navigation cold-compiles the dev portal and cookbook module graph.
  expect: { timeout: 15_000 },
  webServer: [
    {
      command: 'pnpm mock:server',
      url: 'http://localhost:4010/@fusion-mock/discovery',
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'pnpm mock:dev',
      // checked by TCP connect only — the dev server's SPA fallback only responds to
      // requests with an `Accept: text/html` header, which a plain readiness probe omits
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
  use: {
    baseURL: 'http://localhost:3000',
  },
});
