import { defineProject } from '@equinor/fusion-framework-vitest-plugin-react-app/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  test: {
    name: `${name}@${version}`,
    // Compile middleware definitions against the public router contract as well as executing them.
    typecheck: {
      enabled: true,
      include: ['src/__tests__/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
