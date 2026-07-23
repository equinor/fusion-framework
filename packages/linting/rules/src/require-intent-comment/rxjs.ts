import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/rxjs';
const DEFAULT_SEVERITY: Severity = 'warn';

/**
 * Returns `true` when `node` is a `.pipe()` call expression.
 *
 * @param node - AST node to test.
 * @returns `true` if this is a `.pipe(...)` call.
 */
function isPipeCall(node: Node): boolean {
  // Only call expressions qualify
  if (node.type !== 'call_expression') return false;
  const callee = node.childForFieldName('function');
  // The callee must be a member access
  if (callee?.type !== 'member_expression') return false;
  const prop = callee.childForFieldName('property');
  return prop?.text === 'pipe';
}

/**
 * Climbs the parent chain to find the enclosing statement node for a `.pipe()`
 * call.  Handles chained calls like `obs$.pipe(...).subscribe()` where the pipe
 * `call_expression` is nested inside another `call_expression` before reaching
 * the `expression_statement`, as well as `const x = obs$.pipe(...)` patterns.
 */
function getStatementNode(node: Node): Node {
  let current: Node = node;
  // Climb the parent chain to find the enclosing statement node
  while (current.parent) {
    // expression_statement is the statement-level anchor for bare pipe calls
    if (current.parent.type === 'expression_statement') {
      return current.parent;
    }
    // Also handle const/let assignment statements like `const x$ = obs$.pipe(...)`
    if (
      current.parent.type === 'variable_declarator' &&
      current.parent.parent?.type === 'lexical_declaration'
    ) {
      // const/let declarations like `const x$ = obs$.pipe(...)`
      return current.parent.parent;
    }
    // Stop at block boundaries — don't climb past the containing scope
    if (current.parent.type === 'statement_block' || current.parent.type === 'program') {
      // Bail: hit a scope boundary before finding a statement anchor
      break;
    }
    current = current.parent;
  }
  return node;
}

/**
 * Recursively visits every node in the AST and reports `.pipe()` chains
 * that are not immediately preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only report pipe calls that lack a preceding intent comment
  if (isPipeCall(node)) {
    const checkNode = getStatementNode(node);
    // A comment immediately before the statement satisfies the intent requirement
    if (checkNode.previousNamedSibling?.type !== 'comment') {
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `\`.pipe()\` is missing an intent comment`,
        detail: `\`.pipe()\` is missing an intent comment. A comment here explains what the stream emits and how the operators shape it — essential for anyone debugging reactive flows.`,
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
 * Requires every RxJS `.pipe()` chain to be immediately preceded by a comment
 * that explains **why** the transformation pipeline exists.
 *
 * RxJS operator chains are a common source of hard-to-read code.  An intent
 * comment forces the author to articulate the purpose of the pipeline, making
 * it far easier to reason about later.
 *
 * Configure independently: `"require-intent-comment/rxjs": "error"`
 *
 * @example Passing
 * ```typescript
 * // Debounce input and discard stale requests before each search call
 * const result$ = input$.pipe(debounceTime(300), switchMap(search));
 * ```
 *
 * @example Failing
 * ```typescript
 * const result$ = input$.pipe(debounceTime(300), switchMap(search));
 * ```
 */
export const requireIntentCommentRxjs: Rule = {
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
