export { formatAnnotations } from './annotations.js';
export { formatPretty, formatSummary } from './pretty.js';
export { formatRdjsonl } from './rdjsonl.js';
export { formatJson } from './json-report.js';
export type { JsonReport } from './json-report.js';

/**
 * Output reporter names supported by the CLI.
 *
 * - `pretty` — coloured, human-readable terminal output (default)
 * - `github-actions` — GitHub Actions `::warning/::error` workflow annotations
 * - `rdjsonl` — reviewdog NDJSON format; pipe into `reviewdog -f=rdjsonl`
 * - `json` — single JSON report for AI agents; combine with `--output <file>`
 */
export type ReporterName = 'pretty' | 'github-actions' | 'rdjsonl' | 'json';

/**
 * Resolves the active reporter name from CLI flags and environment.
 *
 * Precedence: explicit `--reporter` flag > `--github-actions` flag >
 * `GITHUB_ACTIONS` env var > `'pretty'` default.
 *
 * @param reporter - Value of the `--reporter` option, if provided.
 * @param githubActionsFlag - `true` when `--github-actions` was passed.
 * @returns The resolved `ReporterName`.
 */
export function resolveReporter(reporter?: string, githubActionsFlag?: boolean): ReporterName {
  // Explicit --reporter flag takes highest precedence
  if (
    reporter === 'pretty' ||
    reporter === 'github-actions' ||
    reporter === 'rdjsonl' ||
    reporter === 'json'
  ) {
    return reporter;
  }
  // --github-actions flag and GITHUB_ACTIONS env var are treated as aliases for convenience
  if (githubActionsFlag || process.env['GITHUB_ACTIONS'] === 'true') {
    return 'github-actions';
  }
  return 'pretty';
}
