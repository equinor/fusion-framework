import { defineConfig } from 'vitest/config';

import GithubActionsReporter from 'vitest-github-actions-reporter';
export default defineConfig({
  test: {
    projects: ['packages/**/vitest.config.ts'],
    reporters: process.env.GITHUB_ACTIONS
      ? ['default', new GithubActionsReporter()]
      : [['default', { summary: false }]],
    silent: !process.env.GITHUB_ACTIONS,
    coverage: {
      reporter: ['text', 'json-summary', 'json'],
    },
  },
});
