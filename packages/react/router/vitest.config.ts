import { fileURLToPath } from 'node:url';
import { reactRouterPlugin } from '@equinor/fusion-framework-vite-plugin-react-router';
import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  // Compiles DSL fixtures that import from the public package name, so route-module exports are
  // exercised through the same transform that applications use. Fixtures importing the DSL
  // through relative paths (for example the schema tests) are not touched by the plugin.
  plugins: [reactRouterPlugin()],
  resolve: {
    alias: [
      {
        // Generated route code imports the package root; resolve it to this package's source.
        find: /^@equinor\/fusion-framework-react-router$/,
        replacement: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      },
    ],
  },
  test: {
    include: ['src/__tests__/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['src/__tests__/mocks/**'],
    name: `${name}@${version}`,
    environment: 'happy-dom',
  },
});
