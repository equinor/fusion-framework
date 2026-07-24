import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'no-separate-export';
const DEFAULT_SEVERITY: Severity = 'error';

/**
 * Returns `true` when `node` is a `export { foo }` declaration —
 * an export clause that re-exports a locally defined identifier without a `from` source.
 * Re-exports (`export { foo } from './bar'`) are allowed and return `false`.
 *
 * @param node - An `export_statement` node.
 * @returns `true` if this is a local separate-export declaration.
 */
function isSeparateExport(node: Node): boolean {
  // Only export_statement nodes qualify
  if (node.type !== 'export_statement') return false;
  // Must have an export_clause child (the `{ foo, bar }` part)
  const hasClause = node.children.some((c) => c.type === 'export_clause');
  // Guard: no export clause means this is not a named separate-export statement
  if (!hasClause) return false;
  // Re-exports have a `source` field (`from '...'`) — those are allowed
  return node.childForFieldName('source') === null;
}

/**
 * Recursively visits every node in the AST and reports separate-export declarations.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  // Report any export { foo } without a `from` source
  if (isSeparateExport(node)) {
    // Collect all exported symbol names from the export clause for the diagnostic message
    const exportClause = node.children.find((c) => c.type === 'export_clause');
    const specifierNodes = exportClause?.namedChildren ?? [];
    // Map each export specifier to its identifier text for the diagnostic message
    const specifierNames = specifierNodes.map((c) => c.text);
    const names = specifierNames.join(', ');
    out.push({
      file: filePath,
      line: node.startPosition.row + 1,
      col: node.startPosition.column + 1,
      rule: RULE_ID,
      message: `Separate \`export { ${names} }\` is not allowed — export inline where the symbol is defined`,
      severity,
    });
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out);
  }
}

/**
 * Forbids separate `export { foo }` declarations.
 *
 * Exporting a symbol separately from its definition (`function foo() {} … export { foo }`)
 * splits the reader's attention between two locations and makes it harder to tell at a glance
 * what a module's public surface is.  All exports must be inline:
 * `export function foo() {}` or `export const foo = …`.
 *
 * Re-exports from other modules (`export { foo } from './bar'`) are **not** affected.
 *
 * @example Passing
 * ```typescript
 * export function processItem(item: Item): Result { … }
 * export const DEFAULT_TIMEOUT = 5000;
 * ```
 *
 * @example Failing
 * ```typescript
 * function processItem(item: Item): Result { … }
 * export { processItem };        // ← must be inline
 * ```
 *
 * @returns A configured `Rule` instance.
 */
export function createNoSeparateExport(): Rule {
  return {
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
}

/** Pre-built `no-separate-export` rule with default options. */
export const noSeparateExport: Rule = createNoSeparateExport();
