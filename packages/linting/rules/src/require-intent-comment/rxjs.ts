import type { Node } from 'web-tree-sitter';
import type { Diagnostic, Severity, RuleDef, LintContext } from '@equinor/fusion-framework-lint-core';
import { resolveMatch } from '@equinor/fusion-framework-lint-core';
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
    // return statements like `return obs$.pipe(...)`
    if (current.parent.type === 'return_statement') {
      return current.parent;
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
 * Returns `true` when a `.pipe()` call is chained onto another expression
 * (e.g. `obs$.pipe(...)`) and a comment is placed inline within the chain,
 * immediately before the `.pipe()` call (e.g. `obs$\n  // why\n  .pipe(...)`).
 *
 * @param node - The `.pipe()` call expression to test.
 * @returns `true` if an inline chain comment immediately precedes the call.
 */
function hasInlineChainComment(node: Node): boolean {
  const callee = node.childForFieldName('function');
  // Only member-expression calls (e.g. `obs$.pipe(...)`) can have an inline chain comment
  if (callee?.type !== 'member_expression') return false;
  const object = callee.childForFieldName('object');
  // A comment placed between the object and the method call satisfies the intent requirement
  return object?.nextNamedSibling?.type === 'comment';
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
    // A comment immediately before the statement, or an inline comment within
    // the method chain immediately before this call, satisfies the intent requirement
    if (checkNode.previousNamedSibling?.type !== 'comment' && !hasInlineChainComment(node)) {
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
export const requireIntentCommentRxjs: RuleDef = (options = {}) => ({
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.match */
  match: resolveMatch(options.match),
  /** @inheritdoc Rule.check */
  check(source: string, ctx: LintContext): Diagnostic[] {
    const { filePath } = ctx;
    const tree = tsParser.parse(source);
    // Guard: tsParser.parse returns null for empty or unparseable source
    if (!tree) return [];
    const out: Diagnostic[] = [];
    walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out);
    return out;
  },
});
