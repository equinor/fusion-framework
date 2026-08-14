import { playwright } from '@vitest/browser-playwright';
import react from '@vitejs/plugin-react';
import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  plugins: [react()],
  optimizeDeps: {
    include: [
      '@equinor/eds-tokens',
      '@equinor/eds-utils',
      '@equinor/fusion-wc-person',
      'chalk',
      'react/jsx-dev-runtime',
      'vitest-browser-react',
    ],
  },
  server: { warmup: { clientFiles: ['src/PersonSideSheet/sheets/roles/**/*.{ts,tsx}'] } },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    name: `${name}@${version}`,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
