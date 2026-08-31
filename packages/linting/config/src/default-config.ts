import type { LintConfig } from '@equinor/fusion-framework-lint-core';

/**
 * Loose preset for application code where teams opt into additional quality rules.
 */
export const defaultConfig: LintConfig = {
  'require-intent-comment/flow': 'off',
  'require-intent-comment/iterators': 'off',
  'require-intent-comment/rxjs': 'off',
  'require-intent-comment/break-continue': 'off',
  'require-intent-comment/type-assertion': 'off',
  'require-intent-comment/object-merge': 'off',
  'require-tsdoc': 'warn',
  'require-component-tsdoc': 'warn',
  'require-hook-tsdoc': 'warn',
  'require-property-tsdoc': 'off',
  'require-node-protocol': 'error',
  'no-class-components': 'off',
  'no-todo-without-issue': 'warn',
  'no-empty-catch': 'error',
  'no-separate-export': 'off',
  'single-export-per-file': 'off',
  'filename-convention': 'off',
};
