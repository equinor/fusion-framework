import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'no-todo-without-issue';
const DEFAULT_SEVERITY: Severity = 'warn';

/** Matches task-marker keywords as whole words, case-insensitive. */
const MARKER_RE = /\b(TODO|FIXME|HACK|XXX)\b/i;

/**
 * Matches a GitHub-style issue reference anywhere in the comment text.
 * Accepts `#123`, `(#123)`, etc.
 */
const ISSUE_REF_RE = /#\d+/;

/**
 * Recursively visits every node in the AST and reports task-marker comments
 * that do not include a tracking issue reference.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only comment nodes can contain task markers
  if (node.type === 'comment') {
    const text = node.text;
    // Report the comment only when it has a marker but no issue reference
    if (MARKER_RE.test(text) && !ISSUE_REF_RE.test(text)) {
      const marker = MARKER_RE.exec(text)?.[1]?.toUpperCase() ?? 'TODO';
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `${marker} comment must reference a tracking issue (e.g. \`${marker}(#123):\`)`,
        severity,
      });
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Forbids `TODO`, `FIXME`, `HACK`, and `XXX` comments that do not reference a
 * tracking issue.
 *
 * Deferred-intent markers without an issue reference are unactionable — there is
 * no ownership, no priority, and no way to track resolution.  Every marker must
 * link to a concrete issue so it remains visible outside the codebase.
 *
 * Accepted formats: `TODO(#123):`, `FIXME: #456`, `// HACK #789 workaround`.
 *
 * @example Passing
 * ```typescript
 * // TODO(#1234): remove this workaround once the upstream bug is fixed
 * // FIXME: #456 re-enable strict mode after migration
 * ```
 *
 * @example Failing
 * ```typescript
 * // TODO: remove this workaround
 * // FIXME: re-enable strict mode
 * ```
 */
export const noTodoWithoutIssue: Rule = {
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.check */
  check(source: string, filePath: string): Diagnostic[] {
    const tree = tsParser.parse(source);
    // Guard: tsParser.parse returns null for empty or unparseable source
    if (!tree) return [];
    const out: Diagnostic[] = [];
    walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out);
    return out;
  },
};
