import { defineProject } from 'vitest/config';

import { fileURLToPath } from 'node:url';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    name: `${name}@${version}`,
  },
  resolve: {
    alias: {
      '@local': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
