import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['src/__tests__/**/*.test.ts'],
    name: `${name}@${version}`,
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    testTimeout: 1000,
  },
});
