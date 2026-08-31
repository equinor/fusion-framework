/**
 * Built-in Fusion lint preset names.
 *
 * - `default` is intentionally loose for application code.
 * - `balanced` adds guidance for reusable and publicly consumed code.
 * - `strict` preserves intent and maintainability in critical framework code.
 */
export type LintPreset = 'default' | 'balanced' | 'strict';
