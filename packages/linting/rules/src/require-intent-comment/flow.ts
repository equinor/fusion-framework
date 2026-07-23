import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/flow';
const DEFAULT_SEVERITY: Severity = 'warn';

const FLOW_TYPES = new Set([
  'if_statement',
  'for_statement',
  'for_in_statement',
  'for_of_statement',
  'while_statement',
  'do_statement',
  'switch_statement',
]);

/** Human-readable labels for each tracked control-flow node type. */
const FLOW_LABEL: Record<string, string> = {
  if_statement: '`if` block',
  for_statement: '`for` loop',
  for_in_statement: '`for...in` loop',
  for_of_statement: '`for...of` loop',
  while_statement: '`while` loop',
  do_statement: '`do...while` loop',
  switch_statement: '`switch` block',
};

/** Instruction appended to the diagnostic message per control-flow type. */
const FLOW_DETAIL: Record<string, string> = {
  if_statement:
    'A comment here helps reviewers understand what triggers this branch without having to trace the data flow.',
  for_statement:
    'A comment here makes it clear what is being iterated and why — invaluable when revisiting this code later.',
  for_in_statement:
    'A comment here makes it clear what is being iterated and why — invaluable when revisiting this code later.',
  for_of_statement:
    'A comment here makes it clear what is being iterated and why — invaluable when revisiting this code later.',
  while_statement:
    'A comment here documents what this loop is waiting for and when it should stop — prevents future readers from having to reverse-engineer the exit condition.',
  do_statement:
    'A comment here documents what this loop is waiting for and when it should stop — prevents future readers from having to reverse-engineer the exit condition.',
  switch_statement:
    'A comment here turns a wall of cases into a readable decision table — document what drives this switch.',
};

/**
 * Recursively visits every node in the AST and reports control-flow
 * statements that are not immediately preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Report any control-flow node that lacks a preceding intent comment
  if (FLOW_TYPES.has(node.type)) {
    // else-if branches are part of the same decision chain — no separate comment needed
    const isElseIf = node.type === 'if_statement' && node.parent?.type === 'else_clause';
    // A comment immediately before the node satisfies the intent requirement
    if (!isElseIf && node.previousNamedSibling?.type !== 'comment') {
      const label = FLOW_LABEL[node.type] ?? `\`${node.type.replace(/_/g, ' ')}\``;
      const detail = FLOW_DETAIL[node.type];
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `${label} is missing an intent comment`,
        detail: detail ? `${label} is missing an intent comment. ${detail}` : undefined,
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
 * Requires every control-flow statement to be immediately preceded by a
 * comment that explains **why** the branch or loop exists.
 *
 * Covered nodes: `if`, `for`, `for…in`, `for…of`, `while`, `do…while`, `switch`.
 *
 * Configure independently: `"require-intent-comment/flow": "error"`
 */
export const requireIntentCommentFlow: Rule = {
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
