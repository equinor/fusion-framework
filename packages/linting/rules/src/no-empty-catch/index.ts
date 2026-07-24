import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'no-empty-catch';
const DEFAULT_SEVERITY: Severity = 'error';

/**
 * Returns `true` when `node` is a `console.*` call expression statement —
 * i.e. the only "handling" is logging, which does not constitute real recovery.
 *
 * @param node - AST node to test.
 * @returns `true` if this is a `console.*` call statement.
 */
function isConsoleStatement(node: Node): boolean {
  // Must be an expression statement wrapping a call expression
  if (node.type !== 'expression_statement') return false;
  const expr = node.namedChildren[0];
  // The expression must be a call
  if (expr?.type !== 'call_expression') return false;
  const callee = expr.childForFieldName('function');
  // Callee must be a member expression (e.g. console.error)
  if (callee?.type !== 'member_expression') return false;
  return callee.childForFieldName('object')?.text === 'console';
}

/**
 * Checks whether a catch body is effectively empty: either has no statements,
 * or contains only `console.*` calls.  Comments are excluded from the
 * non-trivial check — a comment alone means the developer acknowledged the
 * swallowed error.
 *
 * @param body - The `statement_block` node of the catch clause.
 * @returns `true` if the catch body contains no meaningful error handling.
 */
function isEffectivelyEmpty(body: Node): boolean {
  // Exclude comments — a comment alone is considered intentional suppression
  const nonCommentChildren = body.namedChildren.filter((c) => c.type !== 'comment');
  // No non-comment children means the catch is completely empty
  if (nonCommentChildren.length === 0) return true;
  // All children being console calls is still considered effectively empty
  const allConsoleCalls = nonCommentChildren.every(isConsoleStatement);
  return allConsoleCalls;
}

/**
 * Returns `true` when the catch body contains at least one comment, which
 * signals the developer intentionally suppressed the error.
 *
 * @param body - The `statement_block` node of the catch clause.
 * @returns `true` if there is at least one comment child.
 */
function hasComment(body: Node): boolean {
  // A single comment node signals that the developer intentionally suppressed the error
  const hasCommentChild = body.namedChildren.some((c) => c.type === 'comment');
  return hasCommentChild;
}

/**
 * Recursively visits every node in the AST and reports catch blocks that
 * silently swallow errors without explanation.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only catch clauses are relevant
  if (node.type === 'catch_clause') {
    const body = node.childForFieldName('body');
    // Report when the body is effectively empty and has no explanatory comment
    if (body && isEffectivelyEmpty(body) && !hasComment(body)) {
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `Empty or console-only catch block silently swallows errors — add a comment explaining why, or handle the error`,
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
 * Forbids `catch` blocks that silently swallow errors without explanation.
 *
 * An empty catch or one that only calls `console.*` is almost always a bug or
 * deferred work.  The guideline states errors must never be silently swallowed.
 * A catch block is considered documented when it contains at least one comment
 * — this signals that the developer consciously decided to suppress the error.
 *
 * @example Passing
 * ```typescript
 * try {
 *   await fs.unlink(lockFile);
 * } catch {
 *   // Lock file may not exist on first run — safe to ignore
 * }
 * ```
 *
 * @example Failing
 * ```typescript
 * try {
 *   await loadConfig();
 * } catch (e) {}  // ← silent failure
 *
 * try {
 *   await loadConfig();
 * } catch (e) {
 *   console.error(e);  // ← logs but does not handle
 * }
 * ```
 */
export const noEmptyCatch: Rule = {
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
