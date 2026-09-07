import { defineConfig } from 'vitest/config';

// Standalone configuration avoids loading package/browser configs that require built packages.
export default defineConfig({
  test: {
    name: 'workflow-scripts',
    include: ['.github/scripts/*.test.mjs'],
    environment: 'node',
  },
});
