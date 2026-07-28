import type { Node } from 'web-tree-sitter';
import type { Diagnostic, Severity, RuleDef, LintContext } from '@equinor/fusion-framework-lint-core';
import { createMatcher, resolveMatch } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../ts-parser.js';
import { tsxParser } from '../tsx-parser.js';

const RULE_ID = 'filename-convention';
const DEFAULT_SEVERITY: Severity = 'warn';

/**
 * Node child types that represent value (non-type) exports — mirrors
 * `single-export-per-file`'s classification so both rules agree on what
 * counts as "the file's export".
 */
const VALUE_EXPORT_CHILD_TYPES = new Set([
  'function_declaration',
  'class_declaration',
  'lexical_declaration', // const / let
  'variable_declaration', // var
  'enum_declaration',
]);

/** React components and classes are named in PascalCase. */
const PASCAL_CASE_RE = /^[A-Z][A-Za-z0-9]*$/;

/**
 * React hooks follow the `useXxx` naming convention — `use` followed by at
 * least one uppercase letter, so it doesn't false-positive on plain-English
 * functions like `used` or `useful`.
 */
const HOOK_NAME_RE = /^use[A-Z][A-Za-z0-9]*$/;

/**
 * Basename patterns exempted from this rule by default. Barrel files have no
 * single export to name themselves after, and declaration files describe an
 * ambient shape rather than a runtime module.
 */
const DEFAULT_EXCLUDE = ['index.ts', 'index.tsx', 'index.mts', 'index.cts', '*.d.ts'];

/** The naming convention a file's primary export is expected to follow. */
type NamingKind = 'class' | 'component' | 'hook' | 'other';

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
  return node.children.some((c) => VALUE_EXPORT_CHILD_TYPES.has(c.type));
}

/**
 * Returns `true` when the `variable_declarator`'s initializer is an arrow
 * function or function expression — the shape used for both components
 * (`export const Foo = () => ...`) and hooks (`export const useFoo = () => ...`).
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
 * Resolves the exported symbol's name and naming convention for a single
 * top-level value export statement.
 *
 * @param node - An `export_statement` AST node already confirmed to be a value export.
 * @returns The export's name and expected naming `kind`, or `null` if no name could be resolved.
 */
function resolveExport(node: Node): { name: string; kind: NamingKind } | null {
  const declaration = node.children.find((c) => VALUE_EXPORT_CHILD_TYPES.has(c.type));
  if (!declaration) return null;

  if (declaration.type === 'class_declaration') {
    const name = declaration.childForFieldName('name')?.text;
    return name ? { name, kind: 'class' } : null;
  }

  if (declaration.type === 'function_declaration') {
    const name = declaration.childForFieldName('name')?.text;
    if (!name) return null;
    // classify by naming shape: hooks first (useXxx), then PascalCase components, else a plain function
    if (HOOK_NAME_RE.test(name)) return { name, kind: 'hook' };
    if (PASCAL_CASE_RE.test(name)) return { name, kind: 'component' };
    return { name, kind: 'other' };
  }

  if (declaration.type === 'enum_declaration') {
    const name = declaration.childForFieldName('name')?.text;
    return name ? { name, kind: 'other' } : null;
  }

  // lexical_declaration (const/let) or variable_declaration (var): inspect the first declarator
  const declarator = declaration.namedChildren.find((c) => c.type === 'variable_declarator');
  if (!declarator) return null;
  const nameNode = declarator.childForFieldName('name');
  // Destructuring exports (e.g. `export const { Consumer, Provider } = ctx`) bind
  // multiple names at once — there's no single export name to file the module after.
  if (!nameNode || nameNode.type !== 'identifier') return null;
  const name = nameNode.text;
  if (!name) return null;
  // only function-like initializers can be components/hooks; plain values are always "other"
  if (isFunctionLike(declarator)) {
    if (HOOK_NAME_RE.test(name)) return { name, kind: 'hook' };
    if (PASCAL_CASE_RE.test(name)) return { name, kind: 'component' };
  }
  return { name, kind: 'other' };
}

/**
 * Converts a `camelCase`/`PascalCase` identifier to `kebab-case`.
 *
 * @param name - The identifier to convert.
 * @returns The kebab-cased equivalent.
 */
function toKebabCase(name: string): string {
  // Preserve a leading underscore verbatim — it's a deliberate "private/internal"
  // naming marker (e.g. `_routerContext` backing an internal React context), not
  // a word separator, so the expected filename keeps the same prefix.
  const leadingUnderscore = /^_+/.exec(name)?.[0] ?? '';
  const rest = name.slice(leadingUnderscore.length);

  const kebab = rest
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    // SCREAMING_SNAKE_CASE constants (e.g. EVENT_NAME) use underscores as word
    // separators instead of case changes — normalize those to hyphens too.
    .replace(/_/g, '-')
    .toLowerCase()
    // Collapse runs of hyphens produced by adjacent underscores and strip any
    // leading/trailing hyphen so the suggested filename is never malformed.
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return `${leadingUnderscore}${kebab}`;
}

/**
 * Extracts the basename of `filePath` without its final extension, e.g.
 * `/src/lib/foo.operator.ts` → `foo.operator`.
 *
 * @param filePath - Absolute or relative file path.
 * @returns The basename with the last extension stripped.
 */
function basenameStem(filePath: string): string {
  const basename = filePath.split(/[/\\]/).pop() ?? filePath;
  return basename.replace(/\.[^.]+$/, '');
}

/**
 * Returns the immediate parent directory's name, already kebab-case (directory
 * names in this repo are kebab-case by convention), or `null` for a file with
 * no meaningful parent segment (e.g. directly under `src`).
 *
 * @param filePath - Absolute or relative file path.
 * @returns The parent directory's basename, or `null` if unavailable.
 */
function parentDirName(filePath: string): string | null {
  const segments = filePath.split(/[/\\]/).filter(Boolean);
  // Need at least [..., dir, file.ts] to have a meaningful parent directory
  if (segments.length < 2) return null;
  const dir = segments[segments.length - 2];
  return dir === 'src' ? null : dir;
}


/**
 * Creates a `filename-convention` rule with the given options.
 *
 * Enforces that a file's name matches the naming convention of its single
 * top-level exported symbol:
 * - Classes and PascalCase components → `PascalCase` filename equal to the export name.
 * - Hooks (`useXxx`) → the filename equals the hook name exactly.
 * - Everything else → `kebab-case` filename derived from the export name
 *   (dots in the stem, e.g. `foo.operator.ts`, are treated as hyphens).
 *
 * Files with zero or more-than-one top-level value export are skipped —
 * there's no single export to name the file after (see `single-export-per-file`).
 *
 * @param options - Rule configuration options.
 * @returns A configured `Rule` instance.
 */
export const filenameConvention: RuleDef = (options = {}) => {
  const match = resolveMatch(options.match) ?? createMatcher([], DEFAULT_EXCLUDE);

  return {
    id: RULE_ID,
    defaultSeverity: DEFAULT_SEVERITY,
    /** @inheritdoc Rule.match */
    match,
    /** @inheritdoc Rule.check */
    check(source: string, ctx: LintContext): Diagnostic[] {
      const { filePath } = ctx;
      // Use the TSX grammar for .tsx files so JSX inside component bodies parses correctly
      const parser = filePath.endsWith('.tsx') ? tsxParser : tsParser;
      const tree = parser.parse(source);
      // Guard: parse returns null for empty or unparseable source
      if (!tree) return [];

      const valueExports = tree.rootNode.children.filter(isValueExport);
      // Skip barrels/multi-export files (single-export-per-file already flags those)
      // and files with no exported value (type-only modules, pure re-exports).
      if (valueExports.length !== 1) return [];

      const resolved = resolveExport(valueExports[0]);
      if (!resolved) return [];
      const { name, kind } = resolved;

      const stem = basenameStem(filePath);

      if (kind === 'class' || kind === 'component') {
        // classes/components must be named after their export exactly, in PascalCase
        if (stem !== name) {
          return [
            {
              file: filePath,
              line: valueExports[0].startPosition.row + 1,
              col: valueExports[0].startPosition.column + 1,
              rule: RULE_ID,
              message: `File exports ${kind} '${name}' but is named '${stem}' — rename the file to '${name}${extOf(filePath)}'`,
              severity: DEFAULT_SEVERITY,
            },
          ];
        }
        return [];
      }

      if (kind === 'hook') {
        // hooks must be named after the hook exactly, e.g. useFoo.ts
        if (stem !== name) {
          return [
            {
              file: filePath,
              line: valueExports[0].startPosition.row + 1,
              col: valueExports[0].startPosition.column + 1,
              rule: RULE_ID,
              message: `File exports hook '${name}' but is named '${stem}' — rename the file to '${name}${extOf(filePath)}'`,
              severity: DEFAULT_SEVERITY,
            },
          ];
        }
        return [];
      }

      // kind === 'other': expect kebab-case. A trailing dotted category suffix is allowed
      // (e.g. `my-foo.schema.ts`, `sse.operator.ts`) — only the base segment before the
      // first dot needs to match the export name; the category itself is unconstrained.
      const expectedKebab = toKebabCase(name);
      const [baseSegment] = stem.split('.');
      // The immediate parent directory can act as an implicit namespace prefix
      // (e.g. `require-intent-comment/flow.ts` exporting `requireIntentCommentFlow`
      // — the directory name plus the filename together spell out the export).
      // Accept either the bare match or the directory-prefixed match.
      const dirKebab = parentDirName(filePath);
      const namespacedKebab = dirKebab ? `${dirKebab}-${baseSegment}` : null;
      if (baseSegment !== expectedKebab && namespacedKebab !== expectedKebab) {
        return [
          {
            file: filePath,
            line: valueExports[0].startPosition.row + 1,
            col: valueExports[0].startPosition.column + 1,
            rule: RULE_ID,
            message: `File exports '${name}' but is named '${stem}' — rename the file to '${expectedKebab}${extOf(filePath)}'`,
            severity: DEFAULT_SEVERITY,
          },
        ];
      }
      return [];
    },
  };
};

/** @param filePath - The file path. @returns The final extension, including the leading dot (e.g. `.ts`). */
function extOf(filePath: string): string {
  const basename = filePath.split(/[/\\]/).pop() ?? filePath;
  const match = /\.[^.]+$/.exec(basename);
  return match ? match[0] : '';
}

export default filenameConvention;
