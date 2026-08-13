import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject((config) => ({
  ...config,
  optimizeDeps: { include: ['vitest-browser-react'] },
  server: { warmup: { clientFiles: ['tests/**/*.{ts,tsx}'] } },
  test: {
    ...config.test,
    include: ['tests/**'],
    name: `${name}@${version}`,
  },
}));
