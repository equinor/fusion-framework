import type { Node } from 'web-tree-sitter';
import type {
  Diagnostic,
  Severity,
  RuleDef,
  LintContext,
  MatcherFn,
} from '@equinor/fusion-framework-lint-core';
import { createMatcher, resolveMatch } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../ts-parser.js';

const RULE_ID = 'single-export-per-file';
const DEFAULT_SEVERITY: Severity = 'warn';

/**
 * Node child types that represent value (non-type) exports.
 * Type-only exports (`export type`, `export interface`) are excluded because
 * they carry no runtime weight and commonly accompany a value export.
 * `enum_declaration` is excluded too — enums are commonly grouped with the
 * related types they describe and shouldn't force a file split on their own.
 */
const VALUE_EXPORT_CHILD_TYPES = new Set([
  'function_declaration',
  'class_declaration',
  'lexical_declaration', // const / let
  'variable_declaration', // var
]);

/**
 * Returns `true` when an `export_statement` is a value export (not a
 * type-only or re-export statement).
 *
 * @param node - An `export_statement` AST node.
 * @returns `true` if the statement exports a runtime value.
 */
function isValueExport(node: Node): boolean {
  // Only export_statement nodes qualify
  if (node.type !== 'export_statement') return false;
  // Re-exports have a `source` field — skip them
  if (node.childForFieldName('source') !== null) return false;
  // Check if any child is a value-bearing declaration type
  const hasValueChild = node.children.some((c) => VALUE_EXPORT_CHILD_TYPES.has(c.type));
  return hasValueChild;
}

/**
 * Returns `true` when a value export is `export default class ... {}` — the
 * `@fusionElement` custom-element registration pattern's defining statement.
 *
 * @param node - A value-exporting `export_statement` AST node.
 * @returns `true` if the statement is a default class export.
 */
function isDefaultClassExport(node: Node): boolean {
  // A default export has a `default` keyword child
  const hasDefaultKeyword = node.children.some((c) => c.type === 'default');
  // ...and its declaration child is a class
  const hasClassChild = node.children.some((c) => c.type === 'class_declaration');
  return hasDefaultKeyword && hasClassChild;
}

/**
 * Returns `true` when a value export is a top-level `const`/`let`/`var`
 * declaration (as opposed to a function/class declaration).
 *
 * @param node - A value-exporting `export_statement` AST node.
 * @returns `true` if the statement declares a const/let/var binding.
 */
function isConstOrLetExport(node: Node): boolean {
  // const/let use lexical_declaration, var uses variable_declaration
  return node.children.some((c) => c.type === 'lexical_declaration' || c.type === 'variable_declaration');
}

/**
 * Filters `exports` down to the set that actually competes for the
 * one-symbol budget: when a default class export (the `@fusionElement`
 * registration pattern) is present, its companion const/let declarations
 * (e.g. a `tag` string) are dropped since they only parameterize it.
 *
 * @param exports - All top-level value exports collected from a file.
 * @returns The subset of `exports` that count toward the rule's limit.
 */
function competingExports(exports: readonly Node[]): Node[] {
  // Whether the file has the @fusionElement default class registration pattern
  const hasDefaultClassExport = exports.some(isDefaultClassExport);
  // No default class export means every export competes as-is
  if (!hasDefaultClassExport) return [...exports];
  // Drop const/let companions so only the default class export remains
  return exports.filter((node) => !isConstOrLetExport(node));
}

/**
 * Basename patterns exempted from this rule, always applied in addition to
 * any `options.match` override. Barrel files legitimately re-export many
 * symbols, so they stay exempt regardless of how callers configure matching.
 */
const DEFAULT_EXCLUDE = ['index.ts', 'index.tsx', 'index.mts', 'index.cts'];

/**
 * Creates a `single-export-per-file` rule with the given options.
 *
 * @param options - Rule configuration options.
 * @returns A configured `Rule` instance.
 */
export const singleExportPerFile: RuleDef = (options = {}) => {
  const barrelMatch = createMatcher([], DEFAULT_EXCLUDE);
  const overrideMatch = resolveMatch(options.match);
  // Barrel files stay exempt even when `options.match` overrides the default matcher
  const match: MatcherFn = overrideMatch
    ? (filePath) => barrelMatch(filePath) && overrideMatch(filePath)
    : barrelMatch;

  return {
    id: RULE_ID,
    defaultSeverity: DEFAULT_SEVERITY,
    /**
     * Barrel files (`index.ts`, etc.) are always exempt. Delegates to
     * `match` so the engine skips calling `check` for them entirely, and
     * callers can further narrow (not widen) matching via `options.match`.
     * @inheritdoc Rule.match
     */
    match,
    /** @inheritdoc Rule.check */
    check(source: string, ctx: LintContext): Diagnostic[] {
      const { filePath } = ctx;
      const tree = tsParser.parse(source);
      // Guard: tsParser.parse returns null for empty or unparseable source
      if (!tree) return [];

      const allExports: Node[] = [];
      // Collect all top-level value export statements
      for (const child of tree.rootNode.children) {
        // Collect each top-level child that is a value export
        if (isValueExport(child)) allExports.push(child);
      }

      const valueExports = competingExports(allExports);

      // Only flag when more than one value export exists
      if (valueExports.length <= 1) return [];

      // Report every export after the first — each is a second (or later) export
      const violations = valueExports.slice(1).map((node) => {
        // Locate the declaration child node (function/class/const etc.)
        const declaration = node.children.find((c) => VALUE_EXPORT_CHILD_TYPES.has(c.type));
        // For function/class: name is a direct field; for const/let: dig into variable_declarator
        const directName = declaration?.childForFieldName('name')?.text;
        // Fallback: for variable declarations, dig into the variable_declarator child
        const declaratorChild = declaration?.children.find((c) => c.type === 'variable_declarator');
        const name = directName ?? declaratorChild?.childForFieldName('name')?.text ?? '(unknown)';
        return {
          file: filePath,
          line: node.startPosition.row + 1,
          col: node.startPosition.column + 1,
          rule: RULE_ID,
          message: `'${name}' is the ${valueExports.indexOf(node) + 1}${nth(valueExports.indexOf(node) + 1)} export in this file — each file should export exactly one symbol (use index.ts for barrels)`,
          severity: DEFAULT_SEVERITY,
        };
      });
      return violations;
    },
  };
};

/** @param n - Ordinal number. @returns Ordinal suffix (`st`, `nd`, `rd`, `th`). */
function nth(n: number): string {
  // 11-13 always use 'th' regardless of last digit (11th, 12th, 13th)
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  // Standard ordinal suffix based on last digit
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return suffixes[n % 10] ?? 'th';
}
