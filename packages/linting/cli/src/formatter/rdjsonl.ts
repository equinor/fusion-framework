import { relative } from 'node:path';
import type { Diagnostic } from '@equinor/fusion-framework-lint-core';

/**
 * A single reviewdog diagnostic entry in the `rdjsonl` NDJSON format.
 *
 * @see https://github.com/reviewdog/reviewdog/tree/master/proto/rdf
 */
interface RdjsonlDiagnostic {
  message: string;
  location: {
    path: string;
    range: {
      start: { line: number; column: number };
    };
  };
  severity: 'ERROR' | 'WARNING';
  code: { value: string };
  source: { name: string };
}

/**
 * Formats diagnostics as reviewdog NDJSON (`rdjsonl`), one JSON object per line.
 *
 * Pipe the output directly into reviewdog:
 * ```sh
 * fusion-lint check "src/**\/*.ts" --reporter=rdjsonl | reviewdog -f=rdjsonl
 * ```
 *
 * @param diagnostics - Diagnostics to format.
 * @returns NDJSON string with one diagnostic per line.
 * @see https://github.com/reviewdog/reviewdog#input-format
 */
export function formatRdjsonl(diagnostics: Diagnostic[]): string {
  // Map each diagnostic to a reviewdog-compatible JSON object then serialise as NDJSON
  const lines = diagnostics.map((d) => {
    const entry: RdjsonlDiagnostic = {
      message: d.detail ?? d.message,
      location: {
        // reviewdog expects relative paths so the annotation lands on the right file in the PR diff
        path: relative(process.cwd(), d.file),
        range: { start: { line: d.line, column: d.col } },
      },
      severity: d.severity === 'error' ? 'ERROR' : 'WARNING',
      code: { value: d.rule },
      source: { name: 'fusion-lint' },
    };
    return JSON.stringify(entry);
  });
  return lines.join('\n') + '\n';
}
