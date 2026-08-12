import { defineProject } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    name: `${name}@${version}`,
    browser: {
      enabled: true,
      provider: playwright(),
      headless: true,
      instances: [{ browser: 'chromium' }],
    },
  },
});
