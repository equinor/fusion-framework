/**
 * Diagnostic severity level.
 */
export type Severity = 'warn' | 'error';

/**
 * A single lint finding produced by a rule.
 */
export interface Diagnostic {
  /** Absolute path to the source file. */
  file: string;
  /** 1-based line number. */
  line: number;
  /** 1-based column number. */
  col: number;
  /** Rule identifier that produced this diagnostic. */
  rule: string;
  /** Human-readable description of the issue. Terse — suitable for JSON output and AI consumers. */
  message: string;
  /**
   * Optional extended description for human-facing surfaces (VS Code hover,
   * Problems panel, reviewdog PR comments). Falls back to `message` when absent.
   */
  detail?: string;
  /** Effective severity for this diagnostic. */
  severity: Severity;
}

/**
 * Per-call context passed to {@link Rule.check}, bundling the file identity
 * and engine-resolved metadata a rule needs during analysis.
 *
 * The engine always re-stamps the final {@link Diagnostic.severity} after
 * `check` returns, so `severity` here is informational — rules may use it
 * to annotate diagnostics as they're created, but callers should not rely
 * on it being the last word.
 */
export interface LintContext {
  /** Absolute file path being linted (used to populate {@link Diagnostic.file}). */
  filePath: string;
  /** Effective severity resolved by the engine (config override or the rule's `defaultSeverity`). */
  severity?: Severity;
}

/**
 * A lint rule that analyses source text and emits diagnostics.
 *
 * Rules are stateless — a single instance may be reused across files.
 */
export interface Rule {
  /** Unique rule identifier, e.g. `require-intent-comment`. */
  readonly id: string;
  /** Severity used when the consumer config has no explicit override. */
  readonly defaultSeverity: Severity;
  /**
   * Optional pre-filter deciding whether {@link Rule.check} should run at all
   * for a given file. Use this to exempt files by path/basename (e.g. barrels,
   * co-located schema/module files) without parsing source. Rules without a
   * `match` are always run.
   *
   * Rules that need path-based filtering typically build their default
   * `match` from {@link import('./matcher.js').createMatcher}, while still
   * honoring a factory `options.match` override via
   * {@link import('./matcher.js').resolveMatch}, so callers
   * can override the matching strategy entirely via config instead of being
   * limited to the rule's own pattern option.
   *
   * @param filePath  Absolute file path being considered for linting.
   * @returns `true` if `check` should run for this file; `false` to skip it entirely.
   */
  match?(filePath: string): boolean;
  /**
   * Analyse `source` and return zero or more diagnostics.
   *
   * @param source  Raw UTF-8 source text of the file.
   * @param ctx  Per-call context: file path plus engine-resolved metadata.
   */
  check(source: string, ctx: LintContext): Diagnostic[];
}

/**
 * Per-rule severity override.  `'off'` disables the rule entirely.
 */
export type SeverityConfig = 'off' | Severity;

/**
 * Flat map of `rule-id → severity`.
 *
 * @example
 * ```json
 * { "require-intent-comment": "error" }
 * ```
 */
export type LintConfig = Record<string, SeverityConfig>;
