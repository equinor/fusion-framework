import type { LintConfig } from '@equinor/fusion-framework-lint-core';

/**
 * Severity overrides for the `recommended` preset.
 */
export const recommendedConfig: LintConfig = {
  'require-intent-comment/flow': 'warn',
  'require-intent-comment/iterators': 'warn',
  'require-intent-comment/rxjs': 'warn',
  'require-intent-comment/break-continue': 'warn',
  'require-intent-comment/type-assertion': 'error',
  'require-tsdoc': 'warn',
  'require-node-protocol': 'error',
  'no-class-components': 'error',
  'no-todo-without-issue': 'warn',
  'no-empty-catch': 'error',
  'no-separate-export': 'error',
  'single-export-per-file': 'warn',
};
