import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  optimizeDeps: {
    include: [
      '@equinor/eds-tokens',
      '@equinor/fusion-wc-person',
      'chalk',
      'react/jsx-dev-runtime',
      'vitest-browser-react',
    ],
  },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    name: `${name}@${version}`,
  },
});
