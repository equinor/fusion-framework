import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['src/**/*.test.ts'],
    name: `${name}@${version}`,
  },
});
