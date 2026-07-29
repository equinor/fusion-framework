import { defineProject } from 'vitest/config';

import { fileURLToPath } from 'node:url';

import { name, version } from './package.json';

export default defineProject({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    name: `${name}@${version}`,
    setupFiles: ['./tests/memfs-plugin.ts'],
  },
  resolve: {
    alias: {
      '@local': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
});
