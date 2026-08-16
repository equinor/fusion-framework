import { playwright } from '@vitest/browser-playwright';
import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  optimizeDeps: { include: ['vitest-browser-react'] },
  server: { warmup: { clientFiles: ['tests/**/*.{ts,tsx}'] } },
  test: {
    include: ['tests/**'],
    name: `${name}@${version}`,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
