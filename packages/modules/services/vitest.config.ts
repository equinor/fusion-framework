import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['tests/**/*.test.ts'],
    name: `${name}@${version}`,
    setupFiles: ['tests/setup.ts'],
  },
});
