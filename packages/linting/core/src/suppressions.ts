/**
 * Matches a `fusion-lint-disable-line` or `fusion-lint-disable-next-line` comment,
 * capturing which of the two directives was used and an optional comma-separated
 * list of rule ids that follows it.
 */
const SUPPRESSION_PATTERN = /fusion-lint-disable-(line|next-line)(?::?\s*([\w,\s-]*))?/;

/**
 * Lookup of suppressed line numbers to either `'all'` (every rule suppressed)
 * or a `Set` of specifically suppressed rule ids.
 */
export type SuppressionMap = Map<number, 'all' | Set<string>>;

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
  // No directive comment on this line — nothing to parse
  if (!match) return null;
  const [, scope, ruleList] = match;
  // An empty or whitespace-only rule list means "suppress every rule"
  const trimmed = ruleList?.trim();
  const ruleIds = trimmed ? splitRuleIds(trimmed) : null;
  return { line: lineNumber, scope: scope as 'line' | 'next-line', ruleIds };
}

/**
 * Splits a comma-separated rule id list into individual, whitespace-trimmed ids.
 *
 * @param ruleList - Comma-separated rule ids, e.g. `"rule-a, rule-b"`.
 * @returns The trimmed rule ids.
 */
function splitRuleIds(ruleList: string): string[] {
  return (
    ruleList
      .split(',')
      // Trim whitespace around each captured rule id
      .map((id) => id.trim())
  );
}

/**
 * Scans `source` for `fusion-lint-disable-line`/`fusion-lint-disable-next-line` comments
 * and builds a lookup of which lines have which rules suppressed.
 *
 * @param source - Raw UTF-8 source text.
 * @returns A map from suppressed line number to either `'all'` (every rule suppressed)
 *   or a `Set` of specifically suppressed rule ids.
 */
export function collectSuppressions(source: string): SuppressionMap {
  const suppressedLines: SuppressionMap = new Map();
  const lines = source.split('\n');

  // Scan every line for a suppression directive comment
  for (let i = 0; i < lines.length; i++) {
    const suppression = parseSuppressionLine(lines[i], i + 1);
    // Not a directive line — move on to the next one
    if (!suppression) continue;

    const targetLine = suppression.scope === 'line' ? suppression.line : suppression.line + 1;
    const existing = suppressedLines.get(targetLine);

    // A bare directive with no rule list suppresses every rule on the target line
    if (suppression.ruleIds === null) {
      // No rule ids specified — suppress everything on the target line
      suppressedLines.set(targetLine, 'all');
      // Nothing left to merge — move on to the next line
      continue;
    }
    // Merge with any rule ids already suppressed on this line by another directive
    const merged =
      existing === 'all' ? 'all' : new Set([...(existing ?? []), ...suppression.ruleIds]);
    suppressedLines.set(targetLine, merged);
  }

  return suppressedLines;
}
