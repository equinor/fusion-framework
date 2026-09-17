import { defineProject } from 'vitest/config';

import { name, version } from './package.json' with { type: 'json' };

export default defineProject({
  // Without this, Vite resolves pnpm's workspace symlinks to their real path (no `node_modules`
  // segment), so its default externalization heuristic misclassifies `resolveOptionalPlugin`'s
  // dynamic `import()` of `@equinor/fusion-framework-cli-plugin-mock-server` as a local module.
  // That forces its whole dependency graph (including `esbuild`, via `@equinor/fusion-imports`)
  // through Vite's SSR transform pipeline instead of a plain Node import, which stalls
  // indefinitely once the shared Vite server is busy with the rest of the workspace's test suite.
  resolve: {
    preserveSymlinks: true,
  },
  test: {
    include: ['src/**/*.test.ts'],
    name: `${name}@${version}`,
  },
});
