import type { SuppressionMap } from './suppressions.js';

/**
 * Determines whether a diagnostic on `line` for `ruleId` is suppressed by
 * a `fusion-lint-disable-line`/`fusion-lint-disable-next-line` comment.
 *
 * @param suppressions - The suppression map produced by {@link collectSuppressions}.
 * @param line - The 1-based line number of the diagnostic.
 * @param ruleId - The rule id that produced the diagnostic.
 * @returns `true` if the diagnostic should be dropped.
 */
export function isSuppressed(suppressions: SuppressionMap, line: number, ruleId: string): boolean {
  const entry = suppressions.get(line);
  // No suppression directive targets this line at all
  if (!entry) return false;
  return entry === 'all' || entry.has(ruleId);
}
