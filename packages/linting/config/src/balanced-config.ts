import type { LintConfig } from '@equinor/fusion-framework-lint-core';

/**
 * Balanced preset for reusable components and non-critical public APIs.
 */
export const balancedConfig: LintConfig = {
  'require-intent-comment/flow': 'off',
  'require-intent-comment/iterators': 'off',
  'require-intent-comment/rxjs': 'off',
  'require-intent-comment/break-continue': 'off',
  'require-intent-comment/type-assertion': 'warn',
  'require-intent-comment/object-merge': 'off',
  'require-tsdoc': 'warn',
  'require-component-tsdoc': 'warn',
  'require-hook-tsdoc': 'warn',
  'require-property-tsdoc': 'warn',
  'require-node-protocol': 'error',
  'no-class-components': 'error',
  'no-todo-without-issue': 'warn',
  'no-empty-catch': 'error',
  'no-separate-export': 'warn',
  'single-export-per-file': 'warn',
  'filename-convention': 'warn',
};
