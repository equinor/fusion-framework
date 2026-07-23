import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'no-class-components';
const DEFAULT_SEVERITY: Severity = 'error';

/**
 * Matches any `extends` clause containing a React component base class name.
 * Covers: `Component`, `PureComponent`, `React.Component`, `React.PureComponent`.
 */
const REACT_COMPONENT_RE = /\b(?:React\.)?(?:Pure)?Component\b/;

/**
 * Returns true when the class node extends a React component base class.
 * Only looks at the `class_heritage` text — avoids deep traversal.
 *
 * @param node - A `class_declaration` AST node.
 * @returns `true` if the class extends a React component base.
 */
function extendsReactComponent(node: Node): boolean {
  // Locate the heritage clause (the `extends ...` part of the class)
  const heritage = node.children.find((c) => c.type === 'class_heritage');
  return heritage !== undefined && REACT_COMPONENT_RE.test(heritage.text);
}

/**
 * Recursively visits every node in the AST and reports class declarations
 * that extend a React component base class.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Only class declarations that extend React components are violations
  if (node.type === 'class_declaration' && extendsReactComponent(node)) {
    const name = node.childForFieldName('name')?.text ?? '(anonymous)';
    out.push({
      file: filePath,
      line: node.startPosition.row + 1,
      col: node.startPosition.column + 1,
      rule: RULE_ID,
      message: `'${name}' is a class component — convert to a function component`,
      severity,
    });
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Forbids React class components (`class Foo extends React.Component`).
 *
 * Fusion Framework requires function components exclusively.  Class components
 * cannot use React hooks and carry significant lifecycle complexity.  This rule
 * flags any `class_declaration` whose `extends` clause references
 * `Component`, `PureComponent`, `React.Component`, or `React.PureComponent`.
 *
 * @example Passing
 * ```typescript
 * export function UserCard({ user }: UserCardProps) {
 *   return <div>{user.name}</div>;
 * }
 * ```
 *
 * @example Failing
 * ```typescript
 * export class UserCard extends React.Component<UserCardProps> {
 *   render() { return <div>{this.props.user.name}</div>; }
 * }
 * ```
 */
export const noClassComponents: Rule = {
  id: RULE_ID,
  defaultSeverity: DEFAULT_SEVERITY,
  /** @inheritdoc Rule.check */
  check(source: string, filePath: string): Diagnostic[] {
    // Only applicable to React component files
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.jsx')) return [];
    const tree = tsParser.parse(source);
    // Guard: tsParser.parse returns null for empty or unparseable source
    if (!tree) return [];
    const out: Diagnostic[] = [];
    walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out);
    return out;
  },
};
