import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/break-continue';
const DEFAULT_SEVERITY: Severity = 'warn';

const LOOP_TYPES = new Set([
  'for_statement',
  'for_in_statement',
  'for_of_statement',
  'while_statement',
  'do_statement',
]);

const SCOPE_BOUNDARY_TYPES = new Set([
  'switch_statement',
  'function_declaration',
  'arrow_function',
  'function',
  'method_definition',
]);

/**
 * Returns `true` when `node` is a `break_statement` that exits a loop rather
 * than a `switch` case.  Climbs the parent chain until it finds a loop node
 * (→ true) or a switch/function boundary (→ false).
 *
 * @param node - The `break_statement` node to test.
 * @returns `true` if this break exits a loop (not a switch case).
 */
function isLoopBreak(node: Node): boolean {
  let current: Node | null = node.parent;
  // Climb ancestors until we hit a loop or a scope boundary
  while (current) {
    // Reached a loop before any switch/function — this is a loop break
    if (LOOP_TYPES.has(current.type)) return true;
    // Reached a switch or function boundary — this is a switch/labeled break
    if (SCOPE_BOUNDARY_TYPES.has(current.type)) return false;
    current = current.parent;
  }
  return false;
}

/**
 * Returns `true` when a `break_statement` carries a label (`break outer`).
 * Labeled breaks escape arbitrary nesting and are never obvious.
 *
 * @param node - The `break_statement` node to inspect.
 * @returns `true` if the break carries a label identifier.
 */
function isLabeled(node: Node): boolean {
  return node.namedChildCount > 0;
}

/**
 * Recursively visits every node in the AST and reports `break` (loop exit)
 * and `continue` statements that are not preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only check nodes that are explicit block children.  Single-line if
  // consequences (`if (cond) break;`) have the wrapping if_statement flagged
  // by `require-intent-comment/flow` — no need to double-report here.
  if (node.parent?.type === 'statement_block') {
    // continue always requires an intent comment explaining why the iteration is skipped
    if (node.type === 'continue_statement') {
      // A comment immediately before satisfies the intent requirement
      if (node.previousNamedSibling?.type !== 'comment') {
        out.push({
          file: filePath,
          line: node.startPosition.row + 1,
          col: node.startPosition.column + 1,
          rule: RULE_ID,
          message: `\`continue\` is missing an intent comment`,
          detail: `\`continue\` is missing an intent comment. A comment here explains why this iteration is deliberately skipped — without one, it looks like a mistake.`,
          severity,
        });
      }
    }

    // break requires a comment only when it exits a loop (switch breaks are exempt)
    if (node.type === 'break_statement' && isLoopBreak(node)) {
      // A comment immediately before satisfies the intent requirement
      if (node.previousNamedSibling?.type !== 'comment') {
        const label = node.namedChild(0)?.text;
        const label_suffix = label ? ` '${label}'` : '';
        out.push({
          file: filePath,
          line: node.startPosition.row + 1,
          col: node.startPosition.column + 1,
          rule: RULE_ID,
          message: `\`break${label_suffix}\` is missing an intent comment`,
          detail: `\`break${label_suffix}\` is missing an intent comment. A comment here explains why the loop exits at this exact point — without one, it reads as an accident.`,
          severity,
        });
      }
    }
  }

  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Requires every `break` (loop exit) and `continue` statement to be immediately
 * preceded by a comment explaining why the loop exits or skips at that point.
 *
 * **Exemptions** (these are handled by other rules or are self-explanatory):
 * - `break` inside a `switch` case — conventional boilerplate, always exempt
 * - Single-line if consequence (`if (cond) break;`) — the wrapping `if` is
 *   already covered by `require-intent-comment/flow`
 *
 * Labeled breaks (`break outer`) are always checked because they escape
 * multiple levels of nesting and are rarely self-documenting.
 *
 * Configure independently: `"require-intent-comment/break-continue": "error"`
 *
 * @example Passing
 * ```typescript
 * for (const item of items) {
 *   if (!item.isValid) continue; // single-line: covered by flow rule on the if
 *   process(item);
 *   // We only process the first valid item
 *   break;
 * }
 * ```
 *
 * @example Failing
 * ```typescript
 * for (const item of items) {
 *   process(item);
 *   break; // ← no comment explaining why we stop
 * }
 * ```
 */
export const requireIntentCommentBreakContinue: Rule = {
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
