import { fileURLToPath } from 'node:url';
import { reactRouterPlugin } from '@equinor/fusion-framework-vite-plugin-react-router';
import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

const routingPlugin = reactRouterPlugin();
const transform = routingPlugin.transform;
// The runtime transform must never rewrite registry source strings inside sitemap tests.
if (typeof transform !== 'function') throw new Error('Expected a route transform function.');
routingPlugin.transform = {
  filter: { id: /\/__tests__\/mocks\/middleware\/routes\.ts$/ },
  handler: transform,
};

export default defineProject({
  // Compiles DSL fixtures that import from the public package name, so route-module exports are
  // exercised through the same transform that applications use. Only the runtime registry
  // fixture is transformed; source-only sitemap tests retain their literal DSL declarations.
  plugins: [routingPlugin],
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
    // Type-level tests compile route context fixtures against the package source.
    typecheck: {
      enabled: true,
      include: ['src/__tests__/**/*.test-d.ts'],
      tsconfig: './tsconfig.test.json',
    },
  },
});
