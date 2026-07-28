import { relative } from 'node:path';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

/**
 * The top-level shape of the JSON reporter output.
 * Designed for direct consumption by AI agents and automation scripts.
 */
export interface JsonReport {
  /** High-level counts for quick triage. */
  summary: {
    /** Total number of source files that were scanned. */
    files: number;
    /** Number of error-severity diagnostics. */
    errors: number;
    /** Number of warn-severity diagnostics. */
    warnings: number;
  };
  /** Flat list of all diagnostics, each with a relative file path. */
  diagnostics: Array<{
    file: string;
    line: number;
    col: number;
    rule: string;
    severity: string;
    message: string;
  }>;
}

/**
 * Formats lint results as a single pretty-printed JSON object.
 *
 * The output is a complete, valid JSON document — not a stream — making it
 * suitable for writing to a file or piping into an AI agent:
 *
 * ```sh
 * fusion-lint changed --reporter=json --output=lint-report.json
 * cat lint-report.json   # AI agent reads and acts on this
 * ```
 *
 * @param diagnostics - All diagnostics collected across every scanned file.
 * @param totalFiles - Total number of files that were scanned (for the summary).
 * @returns Pretty-printed JSON string.
 */
export function formatJson(diagnostics: Diagnostic[], totalFiles: number): string {
  // Tally error-severity diagnostics for the summary block
  const errDiags = diagnostics.filter((d) => d.severity === 'error');
  // Tally warning-severity diagnostics for the summary
  const warnDiags = diagnostics.filter((d) => d.severity === 'warn');
  const errors = errDiags.length;
  const warnings = warnDiags.length;

  // Normalise each diagnostic to a flat, portable object with a relative file path
  const items = diagnostics.map((d) => ({
    file: relative(process.cwd(), d.file),
    line: d.line,
    col: d.col,
    rule: d.rule,
    severity: d.severity,
    message: d.message,
  }));

  const report: JsonReport = {
    summary: { files: totalFiles, errors, warnings },
    diagnostics: items,
  };

  return JSON.stringify(report, null, 2);
}
