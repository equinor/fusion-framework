/**
 * Programmatic and composition API for fusion-lint.
 *
 * @example Embed the lint command in an existing commander program
 * ```typescript
 * import { createLintCommand, createChangedCommand } from '@equinor/fusion-lint';
 *
 * appCommand.addCommand(createLintCommand());
 * appCommand.addCommand(createChangedCommand());
 * // → ffc app lint "src/**\/*.ts"
 * // → ffc app changed --staged
 * ```
 */
export { createLintCommand } from './commands/lint.js';
export { createChangedCommand } from './commands/changed.js';
export { LintEngine } from '@equinor/fusion-framework-lint-core';
export type { Diagnostic, Rule, Severity, LintConfig } from '@equinor/fusion-framework-lint-core';
export { recommendedRules, recommendedConfig } from '@equinor/fusion-framework-lint-config';
export { formatAnnotations, formatPretty, formatSummary } from './formatter/index.js';
