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
   * Analyse `source` and return zero or more diagnostics.
   *
   * @param source  Raw UTF-8 source text of the file.
   * @param filePath  Absolute file path (used to populate {@link Diagnostic.file}).
   * @param severity  Optional per-call severity override.
   */
  check(source: string, filePath: string, severity?: Severity): Diagnostic[];
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
