import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsxParser } from '../_tsx-parser.js';

const RULE_ID = 'require-component-tsdoc';
const DEFAULT_SEVERITY: Severity = 'warn';

/** Matches a TSDoc block comment opener `/**` (not a plain `/*` or `//`). */
const TSDOC_OPEN_RE = /^\/\*\*/;

/**
 * React components are distinguished by their PascalCase name.
 * Functions named with a lowercase first letter are hooks, factories, or utilities.
 */
const PASCAL_CASE_RE = /^[A-Z]/;

/** Returns `true` when `text` is a TSDoc block comment (starts with `/**`). */
function isTsDoc(text: string): boolean {
  return TSDOC_OPEN_RE.test(text.trimStart());
}

/**
 * Returns `true` when the `variable_declarator` holds an arrow function or
 * function expression — the two patterns used to define components as
 * `export const Foo = () => ...` or `export const Foo = function() ...`.
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
 * Returns `true` when the identifier name follows React's PascalCase component
 * convention (starts with an uppercase letter).
 *
 * @param name - The identifier text from the `variable_declarator` name field.
 * @returns `true` if the name looks like a component.
 */
function looksLikeComponent(name: string): boolean {
  return PASCAL_CASE_RE.test(name);
}

/**
 * Checks a single `variable_declarator` that is the direct child of an exported
 * `lexical_declaration` (`const`/`let`).  Reports a missing TSDoc comment when
 * the name is PascalCase and the value is a function-like expression.
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

  // Guard: only PascalCase names are treated as React components
  if (!looksLikeComponent(name)) return;

  const prev = exportStmt.previousNamedSibling;
  // A TSDoc block comment must immediately precede the export statement
  if (prev?.type !== 'comment' || !isTsDoc(prev.text)) {
    out.push({
      file: filePath,
      line: declarator.startPosition.row + 1,
      col: declarator.startPosition.column + 1,
      rule: RULE_ID,
      message: `Component '${name}' is missing a TSDoc comment (\`/** ... */\`)`,
      severity,
    });
  }
}

/**
 * Visits AST nodes looking for exported `const`/`let` declarations whose
 * value is an arrow function or function expression with a PascalCase name.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path used in diagnostic output.
 * @param severity - Severity level for emitted diagnostics.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only exported lexical declarations are in scope — `export const Foo = ...`
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
 * Requires exported React components defined as arrow functions or function
 * expressions to have a TSDoc block comment.
 *
 * Only fires on `.tsx` files to avoid false positives on non-React modules.
 * Only targets PascalCase names — the React convention for components — to
 * avoid flagging hooks, factories, and utility constants.
 *
 * `export function UserCard()` is already covered by the `require-tsdoc` rule;
 * this rule fills the gap for the arrow-function component pattern.
 *
 * @example Passing
 * ```tsx
 * /**
 *  * Displays user identity information.
 *  *
 *  * @param props - User card display properties.
 *  * @returns Rendered user card element.
 *  * /
 * export const UserCard = ({ user }: UserCardProps): JSX.Element => (
 *   <div>{user.name}</div>
 * );
 * ```
 *
 * @example Failing
 * ```tsx
 * export const UserCard = ({ user }: UserCardProps): JSX.Element => (
 *   <div>{user.name}</div>
 * );
 * ```
 */
export const requireComponentTsDoc: Rule = {
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.check */
  check(source: string, filePath: string, severity?: Severity): Diagnostic[] {
    // This rule only applies to TSX files — plain .ts files have no JSX components
    if (!filePath.endsWith('.tsx')) return [];

    const out: Diagnostic[] = [];
    const tree = tsxParser.parse(source);
    if (!tree) return out;
    walkNode(tree.rootNode, filePath, severity ?? DEFAULT_SEVERITY, out);
    return out;
  },
};
