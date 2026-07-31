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
 * Returns `true` when a class member has an `accessibility_modifier` of
 * `private`, or uses the `#name` private-field syntax. Truly private members
 * carry no public API surface, so they're exempt from this rule.
 *
 * @param node - A `public_field_definition` or `method_definition` node.
 * @returns `true` if the member is private.
 */
function isPrivateMember(node: Node): boolean {
  const nameNode = node.childForFieldName('name');
  // `#name` members parse as private_property_identifier regardless of modifiers
  if (nameNode?.type === 'private_property_identifier') return true;
  // Check for an explicit `private` accessibility modifier
  return node.children.some(
    (c) => c.type === 'accessibility_modifier' && c.text === 'private',
  );
}

/**
 * Returns `true` when the member declares a `static` modifier. Static members
 * are commonly used for framework wiring (e.g. Lit's `static styles`) rather
 * than instance-level public API, so they're exempt by default.
 *
 * @param node - A `public_field_definition` or `method_definition` node.
 * @returns `true` if the member is static.
 */
function isStaticMember(node: Node): boolean {
  // Check for a `static` keyword child
  return node.children.some((c) => c.type === 'static');
}

/**
 * Returns `true` when `node` is a `get`/`set` accessor `method_definition`.
 *
 * @param node - A `method_definition` node.
 * @returns `true` if the method is a getter or setter.
 */
function isAccessor(node: Node): boolean {
  return node.children[0]?.type === 'get' || node.children[0]?.type === 'set';
}

/**
 * Returns `true` when `node` is directly preceded by a `decorator` node
 * (e.g. Lit's `@property()` / `@state()` applied to a `get`/`set` accessor).
 * Unlike fields, an accessor's decorator is a sibling in `class_body` rather
 * than a child of the `method_definition` itself.
 *
 * @param node - A `method_definition` node.
 * @returns `true` if the accessor carries a leading decorator.
 */
function isDecoratedAccessor(node: Node): boolean {
  return node.previousNamedSibling?.type === 'decorator';
}

/**
 * Resolves the node that should carry the leading TSDoc comment. For fields,
 * this is the field node itself (decorators live inside it). For a decorated
 * accessor, the decorator sits between the comment and the method, so the
 * anchor is the decorator instead.
 *
 * @param node - A `public_field_definition` or `method_definition` node.
 * @returns The node whose `previousNamedSibling` should be the TSDoc comment.
 */
function resolveCommentAnchor(node: Node): Node {
  return node.previousNamedSibling?.type === 'decorator' ? node.previousNamedSibling : node;
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
 * Checks a single `public_field_definition` or decorated accessor
 * `method_definition` node for a preceding TSDoc comment.
 *
 * @param node - The field or accessor node to inspect.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for the emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function checkFieldNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  const prev = resolveCommentAnchor(node).previousNamedSibling;
  const name = node.childForFieldName('name')?.text ?? '(unknown)';
  // Require a TSDoc comment immediately preceding the declaration (or its decorator)
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
  // Inspect class field declarations and decorated get/set accessors; recurse into everything else
  const isFieldNode = node.type === 'public_field_definition';
  const isDecoratedAccessorNode =
    node.type === 'method_definition' && isAccessor(node) && isDecoratedAccessor(node);
  // Only fields and decorated accessors carry a documentable public API surface
  if (isFieldNode || isDecoratedAccessorNode) {
    const classBody = node.parent;
    const classDecl = classBody?.type === 'class_body' ? classBody.parent : null;
    const inScope =
      classDecl?.type === 'class_declaration' &&
      (classScope === 'all' || isExportedClass(classDecl));
    // Skip private and static members — neither carries public instance API surface
    if (inScope && !isPrivateMember(node) && !isStaticMember(node)) {
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
 * comment — including Lit's `@property()` / `@state()` decorated fields
 * and decorated `get`/`set` accessor pairs, which form the public API
 * surface of a web component. Undecorated accessors are not checked.
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
