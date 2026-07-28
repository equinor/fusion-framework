import type { Node } from 'web-tree-sitter';
import type {
  Diagnostic,
  Severity,
  RuleDef,
  LintContext,
} from '@equinor/fusion-framework-lint-core';
import { resolveMatch } from '@equinor/fusion-framework-lint-core';
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
 * Collects the local binding name introduced by a single `import_specifier` or
 * `namespace_import` node (i.e. the name usable within this file), accounting
 * for `type` prefixes and `as` renames.
 *
 * @param node - An `import_specifier` or `namespace_import` node.
 * @returns The local binding name, or `null` if none could be determined.
 */
function importedLocalName(node: Node): string | null {
  // Narrow to identifier children only, discarding punctuation/keyword tokens like `as`
  const identifiers = node.namedChildren.filter((c) => c?.type === 'identifier');
  // The local binding is always the last identifier: the only one when there's
  // no rename, or the one after `as` when there is
  return identifiers.at(-1)?.text ?? null;
}

/**
 * Walks the full AST and collects every identifier bound by an `import`
 * statement in this file (default, named, type-only, and namespace imports).
 *
 * @param root - The root AST node to scan.
 * @returns The set of locally-bound imported identifier names.
 */
function collectImportedNames(root: Node): Set<string> {
  const imported = new Set<string>();

  // Recursively find every import_statement in the file
  const visit = (node: Node): void => {
    // Only import_statement nodes carry an import_clause worth inspecting
    if (node.type === 'import_statement') {
      // Locate the clause holding the imported bindings (default/named/namespace)
      const clause = node.children.find((c) => c.type === 'import_clause');
      // Each child of the clause represents one form of import binding
      for (const child of clause?.children ?? []) {
        // A bare identifier child means a default import binding
        if (child.type === 'identifier') {
          // Bare default import, e.g. `import Foo from './x.js'`
          imported.add(child.text);
        } else if (child.type === 'named_imports') {
          // `{ foo, type Bar, Baz as Qux }`
          for (const specifier of child.namedChildren) {
            const name = specifier ? importedLocalName(specifier) : null;
            // Skip specifiers we couldn't resolve to a local name
            if (name) imported.add(name);
          }
        } else if (child.type === 'namespace_import') {
          // `* as NS`
          const name = importedLocalName(child);
          // Skip namespace imports we couldn't resolve to a local name
          if (name) imported.add(name);
        }
      }
    }
    // Descend into every child regardless of this node's type, to reach nested import statements
    for (const child of node.children) visit(child);
  };

  visit(root);
  return imported;
}

/**
 * Recursively visits every node in the AST and reports separate-export declarations.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param importedNames - Identifiers bound by an import in this file — re-exporting
 *   one of these under `export { ... }` is not a "define locally, export separately"
 *   violation, so such specifiers are excluded from the diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function walkNode(
  node: Node,
  filePath: string,
  severity: Severity,
  importedNames: Set<string>,
  out: Diagnostic[],
): void {
  // Report any export { foo } without a `from` source
  if (isSeparateExport(node)) {
    // Collect all exported symbol names from the export clause for the diagnostic message
    const exportClause = node.children.find((c) => c.type === 'export_clause');
    const specifierNodes = exportClause?.namedChildren ?? [];
    // Only flag specifiers whose local name was defined in this file, not imported —
    // re-exporting an imported symbol under the same name is a legitimate pattern
    const localSpecifiers = specifierNodes.filter((c) => {
      const localName = c?.namedChildren[0]?.text;
      return localName !== undefined && !importedNames.has(localName);
    });
    // Every specifier in this export clause re-exports an import — nothing to flag
    if (localSpecifiers.length > 0) {
      // Render each flagged specifier's source text for the diagnostic message
      const names = localSpecifiers.map((c) => c?.text ?? '').join(', ');
      out.push({
        file: filePath,
        line: node.startPosition.row + 1,
        col: node.startPosition.column + 1,
        rule: RULE_ID,
        message: `Separate \`export { ${names} }\` is not allowed — export inline where the symbol is defined`,
        severity,
      });
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, importedNames, out);
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
 * Re-exports from other modules (`export { foo } from './bar'`) are **not** affected,
 * and neither is re-exporting an identifier that was itself imported into this file
 * (`import { Foo } from './bar.js'; export { Foo };`) — that's a legitimate re-export,
 * not a locally defined symbol split from its export.
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
export const noSeparateExport: RuleDef = (options = {}) => ({
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
    const importedNames = collectImportedNames(tree.rootNode);
    walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, importedNames, out);
    return out;
  },
});
