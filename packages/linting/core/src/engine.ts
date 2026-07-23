import type { Rule, Diagnostic, LintConfig, Severity } from './types.js';

/**
 * Runs a set of {@link Rule|rules} against source text, applying config overrides.
 *
 * @example
 * ```typescript
 * const engine = new LintEngine([requireIntentComment], { 'require-intent-comment': 'error' });
 * const diagnostics = engine.lint(source, '/path/to/file.ts');
 * ```
 */
export class LintEngine {
  readonly #rules: Map<string, Rule>;
  readonly #config: LintConfig;

  /** @param rules - Set of rules to apply. @param config - Severity overrides keyed by rule ID. */
  constructor(rules: Rule[], config: LintConfig = {}) {
    // Build a map for O(1) rule lookup by ID
    const ruleEntries = rules.map((r) => [r.id, r] as const);
    this.#rules = new Map(ruleEntries as Iterable<[string, Rule]>);
    this.#config = config;
  }

  /**
   * Lint a single source file.
   *
   * @param source  Raw UTF-8 source text.
   * @param filePath  Absolute path used in diagnostic output.
   * @returns All diagnostics from all active rules, with severity overridden by config.
   */
  lint(source: string, filePath: string): Diagnostic[] {
    const results: Diagnostic[] = [];

    // Apply each active rule to the source file
    for (const rule of this.#rules.values()) {
      const configuredSeverity = this.#config[rule.id];

      // 'off' disables the rule entirely
      if (configuredSeverity === 'off') continue;

      // Config override takes precedence; fall back to rule default
      const severity: Severity = (configuredSeverity as Severity) ?? rule.defaultSeverity;

      // Collect diagnostics and stamp them with the resolved severity
      for (const diagnostic of rule.check(source, filePath)) {
        results.push({ ...diagnostic, severity });
      }
    }

    return results;
  }
}
