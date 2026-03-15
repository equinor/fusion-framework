import { defineProject } from 'vitest/config';

import { name, version } from './package.json';

export default defineProject({
  resolve: {
    // @ts-expect-error -- tsconfigPaths is a Vite 8 option; vitest 4.x ships Vite 7 types
    tsconfigPaths: true,
  },
  test: {
    include: ['src/__tests__/**'],
    name: `${name}@${version}`,
    environment: 'happy-dom',
  },
});
