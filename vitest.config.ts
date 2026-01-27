import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    projects: ['packages/**/vitest.config.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'github-actions']
      : [['default', { summary: false }]],
    silent: !process.env.GITHUB_ACTIONS,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
  },
});
