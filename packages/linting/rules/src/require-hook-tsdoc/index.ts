import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';
import { tsxParser } from '../_tsx-parser.js';

const RULE_ID = 'require-hook-tsdoc';
const DEFAULT_SEVERITY: Severity = 'warn';

/** Matches a TSDoc block comment opener `/**` (not a plain `/*` or `//`). */
const TSDOC_OPEN_RE = /^\/\*\*/;

/**
 * React hooks follow the `useXxx` naming convention — `use` followed by at
 * least one uppercase letter, which distinguishes them from plain utility
 * functions like `used` or `useful`.
 */
const HOOK_NAME_RE = /^use[A-Z]/;

/** Returns `true` when `text` is a TSDoc block comment (starts with `/**`). */
function isTsDoc(text: string): boolean {
  return TSDOC_OPEN_RE.test(text.trimStart());
}

/**
 * Returns `true` when the `variable_declarator` holds an arrow function or
 * function expression — the two patterns used to define hooks as
 * `export const useXxx = () => ...` or `export const useXxx = function() ...`.
 *
 * @param declarator - A `variable_declarator` AST node.
 * @returns `true` if the declarator's value is a function-like expression.
 */
function isFunctionLike(declarator: Node): boolean {
  const value = declarator.childForFieldName('value');
  // Guard: no value means no initializer — skip this declarator
  if (!value) return false;
  return value.type === 'arrow_function' || value.type === 'function_expression';
}

/**
 * Returns `true` when the identifier name matches the React hook naming
 * convention: `use` followed by an uppercase letter.
 *
 * @param name - The identifier text from the `variable_declarator` name field.
 * @returns `true` if the name looks like a hook.
 */
function looksLikeHook(name: string): boolean {
  return HOOK_NAME_RE.test(name);
}

/**
 * Checks a single `variable_declarator` that is the direct child of an exported
 * `lexical_declaration`.  Reports a missing TSDoc comment when the name matches
 * the hook naming convention and the value is a function-like expression.
 *
 * @param declarator - The `variable_declarator` node to inspect.
 * @param exportStmt - The wrapping `export_statement` (TSDoc anchor).
 * @param filePath - Source file path used in diagnostic output.
 * @param severity - Severity level for emitted diagnostics.
 * @param out - Accumulator array for collected diagnostics.
 */
function checkDeclarator(
  declarator: Node,
  exportStmt: Node,
  filePath: string,
  severity: Severity,
  out: Diagnostic[],
): void {
  // Guard: only arrow_function / function_expression initialisers qualify
  if (!isFunctionLike(declarator)) return;

  const nameNode = declarator.childForFieldName('name');
  const name = nameNode?.text ?? '';

  // Guard: only `useXxx` names are treated as React hooks
  if (!looksLikeHook(name)) return;

  const prev = exportStmt.previousNamedSibling;
  // A TSDoc block comment must immediately precede the export statement
  if (prev?.type !== 'comment' || !isTsDoc(prev.text)) {
    out.push({
      file: filePath,
      line: declarator.startPosition.row + 1,
      col: declarator.startPosition.column + 1,
      rule: RULE_ID,
      message: `Hook '${name}' is missing a TSDoc comment (\`/** ... */\`)`,
      severity,
    });
  }
}

/**
 * Visits AST nodes looking for exported `const`/`let` declarations whose
 * value is an arrow function or function expression with a hook-style name.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path used in diagnostic output.
 * @param severity - Severity level for emitted diagnostics.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only exported lexical declarations are in scope — `export const useXxx = ...`
  if (node.type === 'export_statement') {
    const decl = node.firstNamedChild;
    // A lexical_declaration holds the `const`/`let` keyword and its variable_declarators
    if (decl?.type === 'lexical_declaration') {
      // Walk all variable_declarator children (multiple declarations on one line are rare but valid)
      for (const child of decl.namedChildren) {
        // Only variable_declarator nodes carry the name and initializer we need to inspect
        if (child.type === 'variable_declarator') {
          checkDeclarator(child, node, filePath, severity, out);
        }
      }
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Requires exported React hooks defined as arrow functions or function
 * expressions to have a TSDoc block comment.
 *
 * Targets names matching `use[A-Z]...` (the React hook convention) in both
 * `.ts` and `.tsx` files.  The `export function useXxx()` form is already
 * covered by the `require-tsdoc` rule; this rule fills the gap for the
 * arrow-function hook pattern.
 *
 * @example Passing
 * ```ts
 * /**
 *  * Fetches paginated context data for the current app scope.
 *  *
 *  * @param query - Filter and pagination parameters.
 *  * @returns Query state including data, loading, and error fields.
 *  * /
 * export const useContextData = (query: Query): QueryState<ContextData[]> => {
 *   // ...
 * };
 * ```
 *
 * @example Failing
 * ```ts
 * export const useContextData = (query: Query): QueryState<ContextData[]> => {
 *   // ...
 * };
 * ```
 */
export const requireHookTsDoc: Rule = {
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.check */
  check(source: string, filePath: string, severity?: Severity): Diagnostic[] {
    const out: Diagnostic[] = [];
    // Use the TSX grammar for .tsx files so JSX inside the hook body parses correctly
    const parser = filePath.endsWith('.tsx') ? tsxParser : tsParser;
    const tree = parser.parse(source);
    if (!tree) return out;
    walkNode(tree.rootNode, filePath, severity ?? DEFAULT_SEVERITY, out);
    return out;
  },
};
