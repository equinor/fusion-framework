import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    projects: [
      'packages/**/vitest.config.ts',
      'cookbooks/**/vitest.config.ts',
      'vue-press/vitest.config.ts',
    ],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', 'github-actions']
      : [['default', { summary: false }]],
    silent: !process.env.GITHUB_ACTIONS,
  },
});
