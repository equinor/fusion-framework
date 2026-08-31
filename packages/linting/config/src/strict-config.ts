import type { LintConfig } from '@equinor/fusion-framework-lint-core';

/**
 * Strict preset for critical framework code whose intent must remain maintainable.
 */
export const strictConfig: LintConfig = {
  'require-intent-comment/flow': 'error',
  'require-intent-comment/iterators': 'error',
  'require-intent-comment/rxjs': 'error',
  'require-intent-comment/break-continue': 'error',
  'require-intent-comment/type-assertion': 'error',
  'require-intent-comment/object-merge': 'error',
  'require-tsdoc': 'error',
  'require-component-tsdoc': 'error',
  'require-hook-tsdoc': 'error',
  'require-property-tsdoc': 'error',
  'require-node-protocol': 'error',
  'no-class-components': 'error',
  'no-todo-without-issue': 'error',
  'no-empty-catch': 'error',
  'no-separate-export': 'error',
  'single-export-per-file': 'error',
  'filename-convention': 'error',
};
