import type { Rule, LintConfig } from '@equinor/fusion-framework-lint-core';
import type { ConfigBuilder } from './config-builder.js';

/**
 * Shape of a `fusion-lint` configuration file when written as a plain object.
 *
 * For the fluent builder API, use {@link defineConfig} with a factory.
 */
export type FusionLintFileConfig =
  | LintConfig
  | {
      /** Severity overrides, keyed by rule ID. */
      rules?: LintConfig;
      /** Custom rule implementations to register alongside built-in rules. */
      customRules?: Rule[];
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
