import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['src/**/__tests__/**', 'src/**/*.{test,spec}.ts'],
    name: `${name}@${version}`,
  },
});
