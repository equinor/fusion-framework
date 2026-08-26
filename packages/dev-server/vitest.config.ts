import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
    name: `${name}@${version}`,
  },
});
