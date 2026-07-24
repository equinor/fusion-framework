import { basename } from 'node:path';
import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'single-export-per-file';
const DEFAULT_SEVERITY: Severity = 'warn';

/**
 * Node child types that represent value (non-type) exports.
 * Type-only exports (`export type`, `export interface`) are excluded because
 * they carry no runtime weight and commonly accompany a value export.
 */
const VALUE_EXPORT_CHILD_TYPES = new Set([
  'function_declaration',
  'class_declaration',
  'lexical_declaration', // const / let
  'variable_declaration', // var
  'enum_declaration',
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
 * Options for the `single-export-per-file` rule.
 */
export interface SingleExportPerFileOptions {
  /**
   * Glob-style base-name patterns for files that are allowed to have multiple
   * exports (e.g. barrel / index files).
   * Default: `['index.ts', 'index.tsx', 'index.mts', 'index.cts']`.
   */
  allowMultipleIn?: string[];
}

/**
 * Creates a `single-export-per-file` rule with the given options.
 *
 * @param options - Rule configuration options.
 * @returns A configured `Rule` instance.
 */
export function createSingleExportPerFile(options: SingleExportPerFileOptions = {}): Rule {
  const { allowMultipleIn = ['index.ts', 'index.tsx', 'index.mts', 'index.cts'] } = options;

  return {
    id: RULE_ID,
    defaultSeverity: DEFAULT_SEVERITY,
    /** @inheritdoc Rule.check */
    check(source: string, filePath: string): Diagnostic[] {
      // Barrel files are explicitly allowed to have many exports
      if (allowMultipleIn.includes(basename(filePath))) return [];

      const tree = tsParser.parse(source);
      // Guard: tsParser.parse returns null for empty or unparseable source
      if (!tree) return [];

      const valueExports: Node[] = [];
      // Collect all top-level value export statements
      for (const child of tree.rootNode.children) {
        // Collect each top-level child that is a value export
        if (isValueExport(child)) valueExports.push(child);
      }

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
}

/** @param n - Ordinal number. @returns Ordinal suffix (`st`, `nd`, `rd`, `th`). */
function nth(n: number): string {
  // 11-13 always use 'th' regardless of last digit (11th, 12th, 13th)
  if (n % 100 >= 11 && n % 100 <= 13) return 'th';
  // Standard ordinal suffix based on last digit
  const suffixes: Record<number, string> = { 1: 'st', 2: 'nd', 3: 'rd' };
  return suffixes[n % 10] ?? 'th';
}

/** Pre-built `single-export-per-file` rule with default options. */
export const singleExportPerFile: Rule = createSingleExportPerFile();
