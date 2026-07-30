import type { Node } from 'web-tree-sitter';
import type {
  Diagnostic,
  Severity,
  RuleDef,
  RuleOptions,
  LintContext,
} from '@equinor/fusion-framework-lint-core';
import { resolveMatch } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../ts-parser.js';

const RULE_ID = 'require-property-tsdoc';
const DEFAULT_SEVERITY: Severity = 'warn';

/** Matches a TSDoc block comment opener `/**` (not a plain `/*` or `//`). */
const TSDOC_OPEN_RE = /^\/\*\*/;

/** Returns `true` when `text` is a TSDoc block comment (starts with `/**`). */
function isTsDoc(text: string): boolean {
  return TSDOC_OPEN_RE.test(text.trimStart());
}

/**
 * Returns `true` when the field has an `accessibility_modifier` of `private`,
 * or uses the `#name` private-field syntax. Truly private fields carry no
 * public API surface, so they're exempt from this rule.
 *
 * @param node - A `public_field_definition` node.
 * @returns `true` if the field is private.
 */
function isPrivateField(node: Node): boolean {
  const nameNode = node.childForFieldName('name');
  // `#name` fields parse as private_property_identifier regardless of modifiers
  if (nameNode?.type === 'private_property_identifier') return true;
  // Check for an explicit `private` accessibility modifier
  return node.children.some(
    (c) => c.type === 'accessibility_modifier' && c.text === 'private',
  );
}

/**
 * Returns `true` when the field declares a `static` modifier. Static fields
 * are commonly used for framework wiring (e.g. Lit's `static styles`) rather
 * than instance-level public API, so they're exempt by default.
 *
 * @param node - A `public_field_definition` node.
 * @returns `true` if the field is static.
 */
function isStaticField(node: Node): boolean {
  // Check for a `static` keyword child
  return node.children.some((c) => c.type === 'static');
}

/**
 * Returns `true` when a `class_declaration` is directly wrapped in an
 * `export_statement` (i.e. `export class Foo {}`).
 *
 * @param node - A `class_declaration` node.
 * @returns `true` if the class is directly exported.
 */
function isExportedClass(node: Node): boolean {
  return node.parent?.type === 'export_statement';
}

/**
 * Checks a single `public_field_definition` node for a preceding TSDoc
 * comment. Decorators (e.g. Lit's `@property()` / `@state()`) live inside
 * the field node itself, so the anchor for the comment is the field node.
 *
 * @param node - The `public_field_definition` node to inspect.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for the emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function checkFieldNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  const prev = node.previousNamedSibling;
  const name = node.childForFieldName('name')?.text ?? '(unknown)';
  // Require a TSDoc comment immediately preceding the field declaration
  if (prev?.type !== 'comment' || !isTsDoc(prev.text)) {
    out.push({
      file: filePath,
      line: node.startPosition.row + 1,
      col: node.startPosition.column + 1,
      rule: RULE_ID,
      message: `'${name}' is missing a TSDoc comment (\`/** ... */\`)`,
      severity,
    });
  }
}

/**
 * Recursively visits every node in the AST and checks class field
 * declarations for a preceding TSDoc comment.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 * @param classScope - Whether to check fields in all classes or only exported ones.
 */
function walkNode(
  node: Node,
  filePath: string,
  severity: Severity,
  out: Diagnostic[],
  classScope: 'all' | 'exported',
): void {
  // Only inspect class field declarations; recurse into everything else
  if (node.type === 'public_field_definition') {
    const classBody = node.parent;
    const classDecl = classBody?.type === 'class_body' ? classBody.parent : null;
    const inScope =
      classDecl?.type === 'class_declaration' &&
      (classScope === 'all' || isExportedClass(classDecl));
    // Skip private and static fields — neither carries public instance API surface
    if (inScope && !isPrivateField(node) && !isStaticField(node)) {
      checkFieldNode(node, filePath, severity, out);
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out, classScope);
  }
}

/**
 * Options for the `require-property-tsdoc` rule.
 */
export interface RequirePropertyTsDocOptions extends RuleOptions {
  /**
   * Which class declarations require their fields to be documented.
   * - `'all'` (default): fields in every named class, exported or not.
   * - `'exported'`: only fields in `export class Foo {}` declarations.
   */
  classScope?: 'all' | 'exported';
}

/**
 * Requires class field (property) declarations to have a TSDoc block
 * comment — including Lit's `@property()` / `@state()` decorated fields,
 * which form the public API surface of a web component.
 *
 * `private` fields (both the `private` modifier and `#name` syntax) and
 * `static` fields are exempt — they carry no instance-level public API.
 *
 * @example Passing
 * ```typescript
 * class MyButton extends LitElement {
 *   /**
 *    * The visual color variant to render.
 *    * /
 *   @property({ type: String })
 *   color: ButtonColor = 'primary';
 * }
 * ```
 *
 * @example Failing
 * ```typescript
 * class MyButton extends LitElement {
 *   @property({ type: String })
 *   color: ButtonColor = 'primary';
 * }
 * ```
 */
export const requirePropertyTsDoc: RuleDef<RequirePropertyTsDocOptions> = (options = {}) => {
  const { classScope = 'all' } = options;
  return {
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
      walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out, classScope);
      return out;
    },
  };
};
