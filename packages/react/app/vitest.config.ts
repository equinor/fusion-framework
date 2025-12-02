import { defineProject } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';

import { name, version } from './package.json';

export default defineProject({
  plugins: [
    tsconfigPaths({
      root: resolve(fileURLToPath(new URL('../../..', import.meta.url))),
      projects: [resolve(fileURLToPath(new URL('.', import.meta.url)), 'tsconfig.json')],
    }),
  ],
  test: {
    include: ['src/__tests__/**'],
    name: `${name}@${version}`,
    environment: 'happy-dom',
  },
});
