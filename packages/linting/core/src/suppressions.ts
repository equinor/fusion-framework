/**
 * Matches a `fusion-lint-disable-line` or `fusion-lint-disable-next-line` comment,
 * capturing which of the two directives was used and an optional comma-separated
 * list of rule ids that follows it.
 */
const SUPPRESSION_PATTERN = /fusion-lint-disable-(line|next-line)(?::?\s*([\w,\s-]*))?/;

/**
 * A suppression directive parsed from a single source line.
 */
interface Suppression {
  /** 1-based line the directive comment was found on. */
  line: number;
  /** `'line'` suppresses diagnostics on the same line, `'next-line'` on the following line. */
  scope: 'line' | 'next-line';
  /** Specific rule ids to suppress, or `null` to suppress every rule. */
  ruleIds: string[] | null;
}

/**
 * Parses a single line for a suppression directive comment.
 *
 * Recognised forms:
 * - `// fusion-lint-disable-line` — suppresses all diagnostics on the same line.
 * - `// fusion-lint-disable-line rule-a, rule-b` — suppresses only the listed rules.
 * - `// fusion-lint-disable-next-line` — suppresses all diagnostics on the following line.
 * - `// fusion-lint-disable-next-line rule-a, rule-b` — suppresses only the listed rules.
 *
 * @param lineText - The raw text of a single source line.
 * @param lineNumber - The 1-based line number `lineText` was taken from.
 * @returns The parsed suppression, or `null` if the line has no directive.
 */
function parseSuppressionLine(lineText: string, lineNumber: number): Suppression | null {
  const match = SUPPRESSION_PATTERN.exec(lineText);
  if (!match) return null;
  const [, scope, ruleList] = match;
  // An empty or whitespace-only rule list means "suppress every rule"
  const trimmed = ruleList?.trim();
  const ruleIds = trimmed ? trimmed.split(',').map((id) => id.trim()) : null;
  return { line: lineNumber, scope: scope as 'line' | 'next-line', ruleIds };
}

/**
 * Scans `source` for `fusion-lint-disable-line`/`fusion-lint-disable-next-line` comments
 * and builds a lookup of which lines have which rules suppressed.
 *
 * @param source - Raw UTF-8 source text.
 * @returns A map from suppressed line number to either `'all'` (every rule suppressed)
 *   or a `Set` of specifically suppressed rule ids.
 */
export function collectSuppressions(source: string): Map<number, 'all' | Set<string>> {
  const suppressedLines = new Map<number, 'all' | Set<string>>();
  const lines = source.split('\n');

  // Scan every line for a suppression directive comment
  for (let i = 0; i < lines.length; i++) {
    const suppression = parseSuppressionLine(lines[i], i + 1);
    if (!suppression) continue;

    const targetLine = suppression.scope === 'line' ? suppression.line : suppression.line + 1;
    const existing = suppressedLines.get(targetLine);

    if (suppression.ruleIds === null) {
      // No rule ids specified — suppress everything on the target line
      suppressedLines.set(targetLine, 'all');
      continue;
    }
    // Merge with any rule ids already suppressed on this line by another directive
    const merged = existing === 'all' ? 'all' : new Set([...(existing ?? []), ...suppression.ruleIds]);
    suppressedLines.set(targetLine, merged);
  }

  return suppressedLines;
}

/**
 * Determines whether a diagnostic on `line` for `ruleId` is suppressed by
 * a `fusion-lint-disable-line`/`fusion-lint-disable-next-line` comment.
 *
 * @param suppressions - The suppression map produced by {@link collectSuppressions}.
 * @param line - The 1-based line number of the diagnostic.
 * @param ruleId - The rule id that produced the diagnostic.
 * @returns `true` if the diagnostic should be dropped.
 */
export function isSuppressed(
  suppressions: Map<number, 'all' | Set<string>>,
  line: number,
  ruleId: string,
): boolean {
  const entry = suppressions.get(line);
  if (!entry) return false;
  return entry === 'all' || entry.has(ruleId);
}
