import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['src/**/__tests__/**/*.test.ts'],
    name: `${name}@${version}`,
    typecheck: {
      enabled: true,
      include: ['src/**/__tests__/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
