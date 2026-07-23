import type {
  Rule,
  Diagnostic,
  LintConfig,
  SeverityConfig,
} from '@equinor/fusion-framework-lint-core';

/**
 * The resolved output of {@link loadLintConfig}.
 */
export interface LoadedLintConfig {
  /** Final severity config. */
  config: LintConfig;
  /** Custom rule implementations declared in the config file. */
  customRules: Rule[];
}

/**
 * Inline rule definition accepted by {@link ConfigBuilder.addRule}.
 *
 * Uses `severity` (user-facing) rather than `defaultSeverity` (internal).
 */
export interface CustomRuleDefinition {
  /** Unique rule identifier. */
  id: string;
  /** Initial severity for this rule. Defaults to `'warn'`. */
  severity?: SeverityConfig;
  /**
   * Analyses source text and returns zero or more diagnostics.
   *
   * @param source - Raw UTF-8 source text.
   * @param filePath - Absolute path to the source file.
   * @returns Array of diagnostics found in the source.
   */
  check(source: string, filePath: string): Diagnostic[];
}

/**
 * Mutable view of a rule's severity, passed to {@link ConfigBuilder.configureRule}.
 */
export interface MutableRuleConfig {
  /** Current severity override for the rule. */
  severity: SeverityConfig;
}

/**
 * Fluent builder passed to factory-style configs.
 *
 * Collects rule additions and severity overrides, then resolves them into a
 * {@link LoadedLintConfig} when the loader calls {@link ConfigBuilder.resolve}.
 *
 * @example
 * ```ts
 * export default defineConfig((args) => {
 *   args.recommended = true;
 *   args.configureRule('require-tsdoc', (rule) => { rule.severity = 'error'; });
 *   args.addRule({
 *     id: 'my-rule',
 *     severity: 'warn',
 *     check: (source, filePath) => [],
 *   });
 * });
 * ```
 */
export class ConfigBuilder {
  /**
   * When `true`, the recommended preset is used as the base before applying
   * any `configureRule` overrides.
   * @default false
   */
  recommended = false;

  readonly #customRules: Map<string, Rule> = new Map();
  readonly #severityOverrides: Map<string, SeverityConfig> = new Map();
  readonly #removedRules: Set<string> = new Set();

  /**
   * Registers a rule into the builder.
   *
   * Accepts either a fully-constructed {@link Rule} (e.g. from
   * `@equinor/fusion-framework-lint-rules`) or an inline
   * {@link CustomRuleDefinition}:
   *
   * ```ts
   * // pre-built rule from the rules package
   * builder.addRule(someRule({ someArg: true }));
   *
   * // inline rule definition
   * builder.addRule({ id: 'my-rule', severity: 'warn', check: () => [] });
   * ```
   *
   * @param def - A `Rule` or inline `CustomRuleDefinition`.
   * @returns `this` for chaining.
   */
  addRule(def: Rule | CustomRuleDefinition): this {
    // Rule uses `defaultSeverity`; CustomRuleDefinition uses `severity`
    const isRule = 'defaultSeverity' in def;
    const rule: Rule = isRule
      ? def
      : {
          id: def.id,
          defaultSeverity: def.severity === 'off' ? 'warn' : (def.severity ?? 'warn'),
          check: def.check,
        };
    this.#customRules.set(rule.id, rule);
    const severity = isRule ? def.defaultSeverity : def.severity;
    // Seed the severity-override map so configureRule can adjust it later
    if (severity) this.#severityOverrides.set(rule.id, severity);
    return this;
  }

  /**
   * Removes a rule by ID.
   *
   * For built-in rules (present in the recommended preset), the rule is set to
   * `'off'` in the resolved config so the engine skips it. For custom rules
   * added via {@link addRule}, the rule is dropped entirely from `customRules`.
   *
   * ```ts
   * args.recommended = true;
   * args.removeRule('require-tsdoc'); // disable this built-in rule
   * ```
   *
   * @param id - ID of the rule to remove.
   * @returns `this` for chaining.
   */
  removeRule(id: string): this {
    this.#customRules.delete(id);
    this.#severityOverrides.delete(id);
    // Mark as removed so resolve() can set it to 'off' for built-in rules
    this.#removedRules.add(id);
    return this;
  }

  /**
   * Overrides the severity of an existing rule by ID.
   *
   * Can target both built-in rules and rules previously added via {@link addRule}.
   *
   * @param id - Rule ID to configure.
   * @param fn - Receives a mutable config object; set `rule.severity` to the desired level.
   * @returns `this` for chaining.
   */
  configureRule(id: string, fn: (rule: MutableRuleConfig) => void): this {
    const current = this.#severityOverrides.get(id) ?? 'warn';
    const proxy: MutableRuleConfig = { severity: current };
    fn(proxy);
    // Apply the mutated severity as an override
    this.#severityOverrides.set(id, proxy.severity);
    return this;
  }

  /**
   * Resolves the builder state into a {@link LoadedLintConfig}.
   *
   * Called by the loader after the factory function has finished executing.
   *
   * @param base - Base severity config merged under severity overrides (overrides win).
   * @returns The resolved config ready for the lint engine.
   */
  resolve(base: LintConfig): LoadedLintConfig {
    // Build removed-rules override map: set each removed ID to 'off'
    const removedEntries = [...this.#removedRules].map((id) => [id, 'off'] as const);
    // Merge order: recommended base → severity overrides → removed-rule 'off' entries
    const config: LintConfig = {
      ...(this.recommended ? base : {}),
      ...Object.fromEntries(this.#severityOverrides),
      ...Object.fromEntries(removedEntries),
    };
    return {
      config,
      customRules: [...this.#customRules.values()],
    };
  }
}
