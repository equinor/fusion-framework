import { playwright } from '@vitest/browser-playwright';
import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

// These component tests need no app-test virtual modules. Keeping their browser setup local
// avoids pulling the CLI and its dev portal back into the roles component dependency graph.
export default defineProject({
  test: {
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    name: `${name}@${version}`,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      // Preserve the app-test preset's desktop viewport for existing component assertions.
      viewport: { width: 1024, height: 768 },
      instances: [{ browser: 'chromium' }],
    },
  },
  // Discover lazy dependencies before a test starts so optimization cannot reload it mid-run.
  server: { warmup: { clientFiles: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'] } },
  optimizeDeps: { entries: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts'] },
});
