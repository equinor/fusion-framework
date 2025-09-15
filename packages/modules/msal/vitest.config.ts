import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    environment: 'node',
    include: ['src/__tests__/**/*.test.ts'],
    name: `${name}@${version}`,
  },
});
