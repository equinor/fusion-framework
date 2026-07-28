import type { Node } from 'web-tree-sitter';
import type { Diagnostic, Severity, RuleDef, LintContext } from '@equinor/fusion-framework-lint-core';
import { resolveMatch } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-intent-comment/object-merge';
const DEFAULT_SEVERITY: Severity = 'warn';

/**
 * Returns `true` when `node` is an `Object.assign(target, ...sources)` call
 * merging **one or more** source objects into `target`.
 *
 * A bare `Object.assign(target)` with no sources is a no-op and is
 * intentionally not flagged — every call that actually merges data needs
 * its intent documented, regardless of how many sources it merges.
 *
 * @param node - AST node to test.
 * @returns `true` if this is an `Object.assign()` call with at least one source.
 */
function isObjectAssignMerge(node: Node): boolean {
  // Only call expressions can be Object.assign() calls
  if (node.type !== 'call_expression') return false;
  const callee = node.childForFieldName('function');
  // Object.assign is accessed as a member expression off the Object global
  if (callee?.type !== 'member_expression') return false;
  const objectNode = callee.childForFieldName('object');
  const propertyNode = callee.childForFieldName('property');
  if (objectNode?.text !== 'Object' || propertyNode?.text !== 'assign') return false;
  const argsNode = node.childForFieldName('arguments');
  // target + 1 or more sources means at least 2 arguments total
  return (argsNode?.namedChildren.length ?? 0) >= 2;
}

/**
 * Returns `true` when `node` is an object (`{ ...a, ...b }`) or array
 * (`[...a, ...b]`) literal spreading **two or more** sources together.
 *
 * A single spread mixed with explicit properties (`{ ...state, enabled: true }`)
 * is the common immutable-update pattern and is intentionally not flagged —
 * only literals merging multiple distinct sources need their intent documented.
 *
 * @param node - AST node to test.
 * @returns `true` if this is a multi-source spread merge.
 */
function isMergeSpreadLiteral(node: Node): boolean {
  // Only object and array literals can contain spread elements
  if (node.type !== 'object' && node.type !== 'array') return false;
  const spreadCount = node.namedChildren.filter((c) => c?.type === 'spread_element').length;
  return spreadCount >= 2;
}

/**
 * Climbs the parent chain to find the enclosing statement node for a merge
 * expression, mirroring the anchor logic used by the `rxjs` intent-comment
 * rule so `return`, `const`/`let`, and bare-expression statements are all
 * recognised as valid comment anchors.
 *
 * @param node - The merge call/literal node to find an anchor for.
 * @returns The enclosing statement node, or `node` itself if none was found.
 */
function getStatementNode(node: Node): Node {
  let current: Node = node;
  // Climb the parent chain to find the enclosing statement node
  while (current.parent) {
    // expression_statement is the statement-level anchor for bare merge calls
    if (current.parent.type === 'expression_statement') {
      return current.parent;
    }
    // Also handle const/let assignment statements like `const merged = Object.assign(...)`
    if (
      current.parent.type === 'variable_declarator' &&
      current.parent.parent?.type === 'lexical_declaration'
    ) {
      return current.parent.parent;
    }
    // return statements like `return { ...a, ...b }`
    if (current.parent.type === 'return_statement') {
      return current.parent;
    }
    // Stop at block boundaries — don't climb past the containing scope
    if (current.parent.type === 'statement_block' || current.parent.type === 'program') {
      break;
    }
    current = current.parent;
  }
  return node;
}

/**
 * Recursively visits every node in the AST and reports multi-source
 * `Object.assign()` calls and spread-merge literals that are not immediately
 * preceded by an intent comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only process the two merge shapes this rule cares about
  const isAssignMerge = isObjectAssignMerge(node);
  const isSpreadMerge = isMergeSpreadLiteral(node);
  if (isAssignMerge || isSpreadMerge) {
    const checkNode = getStatementNode(node);
    // A comment immediately before the anchoring statement satisfies the intent requirement
    if (checkNode.previousNamedSibling?.type !== 'comment') {
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: isAssignMerge
          ? '`Object.assign()` merging multiple sources is missing an intent comment'
          : 'Spreading multiple sources into a single literal is missing an intent comment',
        detail:
          'Merging multiple sources into one object/array hides which source "wins" on key conflicts. A comment here documents the merge order and why it exists.',
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
 * Requires every `Object.assign(target, ...sources)` call and every
 * multi-source spread literal — `{ ...a, ...b }` / `[...a, ...b]` — to be
 * immediately preceded by a comment that explains **why** the sources are
 * being combined and, where relevant, which source takes precedence.
 *
 * A no-op `Object.assign(target)` with no sources and single-spread-plus-overrides
 * literals (the common immutable-update pattern, e.g. `{ ...state, x: true }`)
 * are intentionally not flagged, to avoid drowning out genuine merges.
 *
 * Configure independently: `"require-intent-comment/object-merge": "error"`
 *
 * @example Passing
 * ```typescript
 * // Environment overrides win over defaults, which win over hardcoded fallbacks
 * const config = Object.assign({}, fallbacks, defaults, env);
 * ```
 *
 * @example Failing
 * ```typescript
 * const config = Object.assign({}, fallbacks, defaults, env);
 * ```
 */
export const requireIntentCommentObjectMerge: RuleDef = (options = {}) => ({
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
