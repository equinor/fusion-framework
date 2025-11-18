import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  test: {
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/__tests__/mocks/**'],
    name: `${name}@${version}`,
    environment: 'happy-dom',
  },
});

