import type { Rule, LintConfig, SeverityConfig } from '@equinor/fusion-framework-lint-core';
import type { ConfigBuilder } from './ConfigBuilder.js';
import type { LintPreset } from './lint-preset.js';

/**
 * Per-rule configuration entry accepted in the `rules` map of a
 * {@link FusionLintFileConfig}. Either a bare severity string (the existing
 * flat shorthand), or an object combining a severity with basename-pattern
 * file scoping — applied via {@link import('@equinor/fusion-framework-lint-core').createMatcher}
 * — so JSON/YAML configs can scope or exempt a rule by file without writing
 * any TypeScript.
 *
 * @example Severity shorthand (unchanged behavior)
 * ```json
 * { "rules": { "require-tsdoc": "error" } }
 * ```
 * @example Severity plus file scoping
 * ```json
 * {
 *   "rules": {
 *     "single-export-per-file": { "excludePattern": ["module.ts", "*.schemas.ts"] }
 *   }
 * }
 * ```
 */
export type RuleConfigEntry =
  | SeverityConfig
  | {
      /** Severity override for this rule. Defaults to the rule's own default severity. */
      severity?: SeverityConfig;
      /**
       * Glob-style basename patterns the file must match for this rule to
       * run (only `*` is supported). An empty/omitted list matches every file.
       */
      includePattern?: string[];
      /**
       * Glob-style basename patterns for files to exempt from this rule
       * (only `*` is supported). Takes precedence over `includePattern`.
       */
      excludePattern?: string[];
    };

/**
 * Shape of a `fusion-lint` configuration file when written as a plain object.
 *
 * For the fluent builder API, use {@link defineConfig} with a factory.
 */
export type FusionLintFileConfig =
  | LintConfig
  | {
      /** Built-in severity preset used before applying `rules` overrides. */
      preset?: LintPreset;
      /** Severity and/or file-scoping overrides, keyed by rule ID. */
      rules?: Record<string, RuleConfigEntry>;
      /** Custom rule implementations to register alongside built-in rules. */
      customRules?: Rule[];
      /**
       * Glob patterns for files/directories to exclude from linting entirely,
       * e.g. `['**\/__tests__/**']`. Matched the same way as `.gitignore` entries.
       */
      ignorePatterns?: string[];
    };

/** Factory function passed to {@link defineConfig}. Receives a {@link ConfigBuilder}. */
export type FusionLintConfigFactory = (builder: ConfigBuilder) => void | Promise<void>;

/**
 * Type helper that provides full type inference for `fusion-lint` config files.
 *
 * **Object form** — flat severity map or rich object with custom rules:
 * ```ts
 * export default defineConfig({ 'require-tsdoc': 'error' });
 * ```
 *
 * **Builder form** — fluent API with `recommended`, `addRule`, and `configureRule`:
 * ```ts
 * export default defineConfig((args) => {
 *   args.recommended = true;
 *   args.configureRule('require-tsdoc', (rule) => { rule.severity = 'error'; });
 *   args.addRule({ id: 'my-rule', severity: 'warn', check: () => [] });
 * });
 * ```
 *
 * @param input - Config object or builder factory.
 * @returns The input unchanged — exists solely for type inference.
 */
export function defineConfig(config: FusionLintFileConfig): FusionLintFileConfig;
export function defineConfig(factory: FusionLintConfigFactory): FusionLintConfigFactory;
/** @inheritdoc */
export function defineConfig(
  input: FusionLintFileConfig | FusionLintConfigFactory,
): FusionLintFileConfig | FusionLintConfigFactory {
  return input;
}
