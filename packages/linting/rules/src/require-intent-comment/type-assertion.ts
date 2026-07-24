import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/type-assertion';
const DEFAULT_SEVERITY: Severity = 'error';

/**
 * Returns `true` when `node` is `as any` — the target type is the `any`
 * predefined type, which completely disables type checking for the expression.
 *
 * @param node - AST node to test.
 * @returns `true` if this is an `as any` cast.
 */
function isAsAny(node: Node): boolean {
  // Only as_expression nodes qualify
  if (node.type !== 'as_expression') return false;
  const typeChild = node.namedChildren[node.namedChildCount - 1];
  return typeChild?.type === 'predefined_type' && typeChild.text === 'any';
}

/**
 * Returns `true` when `node` is the outer half of a double-cast
 * `value as unknown as T`.  The inner expression must itself be an
 * `as_expression` whose target type is `unknown`.
 *
 * @param node - AST node to test.
 * @returns `true` if this is a double-cast through `unknown`.
 */
function isDoubleCast(node: Node): boolean {
  // Outer node must be an as_expression
  if (node.type !== 'as_expression') return false;
  const inner = node.namedChildren[0];
  // Inner expression must also be an as_expression
  if (inner?.type !== 'as_expression') return false;
  const innerType = inner.namedChildren[inner.namedChildCount - 1];
  return innerType?.type === 'predefined_type' && innerType.text === 'unknown';
}

/**
 * Climbs the parent chain to find the enclosing statement so we can check
 * for a preceding intent comment.  Handles assignments, return values, and
 * expressions inside chained calls.
 *
 * @param node - Starting node to climb from.
 * @returns The nearest enclosing statement node, or `node` itself if none found.
 */
function getStatementNode(node: Node): Node {
  let current: Node = node;
  // Climb until we reach a statement or a block boundary
  while (current.parent) {
    const pt = current.parent.type;
    // expression_statement and return_statement are both valid anchors
    if (pt === 'expression_statement' || pt === 'return_statement') {
      return current.parent;
    }
    // Also handle const/let assignment anchors like `const x = val as any`
    if (
      current.parent.type === 'variable_declarator' &&
      current.parent.parent?.type === 'lexical_declaration'
    ) {
      // const/let declaration anchor for `const x = val as any`
      return current.parent.parent;
    }
    // Stop at block and program boundaries
    if (pt === 'statement_block' || pt === 'program') break;
    current = current.parent;
  }
  return node;
}

/**
 * Recursively visits every node in the AST and reports dangerous type
 * assertions that are not preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Check for dangerous casts: `as any` or `as unknown as T`
  if (isAsAny(node) || isDoubleCast(node)) {
    const statementNode = getStatementNode(node);
    // A comment immediately before the statement satisfies the intent requirement
    if (statementNode.previousNamedSibling?.type !== 'comment') {
      const castText = isDoubleCast(node)
        ? `'as unknown as ${node.namedChildren[node.namedChildCount - 1]?.text}'`
        : "'as any'";
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `${castText} is missing an intent comment`,
        detail: `${castText} is missing an intent comment. Type assertions bypass the compiler — a comment here proves the cast is intentional and explains why it is safe.`,
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
 * Requires dangerous type assertions to be preceded by a comment explaining
 * why the cast is safe.
 *
 * Two patterns are targeted:
 * - **`as any`** — disables all type checking on the expression.
 * - **`as unknown as T`** — double-cast that forces an incompatible type;
 *   TypeScript cannot verify the safety of the outer cast.
 *
 * Normal narrowing casts (`event.target as HTMLInputElement`) are not flagged.
 *
 * @example Passing
 * ```typescript
 * // The external API guarantees this field is always a Record at runtime
 * const config = rawResponse.data as unknown as AppConfig;
 * ```
 *
 * @example Failing
 * ```typescript
 * const config = rawResponse.data as unknown as AppConfig; // ← no comment
 * const value = (input as any).field;                      // ← no comment
 * ```
 */
export const requireIntentCommentTypeAssertion: Rule = {
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
