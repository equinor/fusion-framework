import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/iterators';
const DEFAULT_SEVERITY: Severity = 'warn';

const ITERATOR_METHODS = new Set([
  'forEach',
  'map',
  'filter',
  'reduce',
  'reduceRight',
  'some',
  'every',
  'find',
  'findIndex',
]);

/**
 * Returns `true` when `node` is a call expression invoking one of the
 * iterator methods defined in `ITERATOR_METHODS`.
 *
 * @param node - AST node to test.
 * @returns `true` if the node is an iterator method call.
 */
function isIteratorCall(node: Node): boolean {
  // Only call expressions can be iterator calls
  if (node.type !== 'call_expression') return false;
  const callee = node.childForFieldName('function');
  // Must be a member access (e.g. arr.map)
  if (callee?.type !== 'member_expression') return false;
  const prop = callee.childForFieldName('property');
  return prop !== null && ITERATOR_METHODS.has(prop.text);
}

/**
 * Recursively visits every node in the AST and reports iterator method calls
 * that are not immediately preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only process iterator call expressions
  if (isIteratorCall(node)) {
    // The intent comment must precede the enclosing *statement*, not the call expression itself
    let checkNode: Node = node;
    // expression_statement wraps bare iterator calls like `arr.forEach(...)`
    if (node.parent?.type === 'expression_statement') {
      checkNode = node.parent;
    } else if (
      node.parent?.type === 'variable_declarator' &&
      node.parent.parent?.type === 'lexical_declaration'
    ) {
      // const/let declarations like `const x = arr.map(...)`
      checkNode = node.parent.parent;
    }

    // A comment immediately before the statement satisfies the intent requirement
    if (checkNode.previousNamedSibling?.type !== 'comment') {
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `\`.${node.childForFieldName('function')?.childForFieldName('property')?.text ?? 'iterator'}()\` is missing an intent comment`,
        detail: `\`.${node.childForFieldName('function')?.childForFieldName('property')?.text ?? 'iterator'}()\` is missing an intent comment. A comment here documents what is being transformed and what the result represents — keeping the chain readable as it grows.`,
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
 * Requires every iterator method call (`forEach`, `map`, `filter`, …) to be
 * immediately preceded by a comment that explains **why** the iteration exists.
 *
 * Configure independently: `"require-intent-comment/iterators": "error"`
 */
export const requireIntentCommentIterators: Rule = {
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
