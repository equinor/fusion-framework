import type { Node } from 'web-tree-sitter';
import type { Rule, Diagnostic, Severity } from '@equinor/fusion-framework-lint-core';
import { tsParser } from '../_parser.js';

const RULE_ID = 'require-tsdoc';
const DEFAULT_SEVERITY: Severity = 'warn';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Matches a TSDoc block comment opener `/**` (not a plain `/*` or `//`). */
const TSDOC_OPEN_RE = /^\/\*\*/;
const PARAM_TAG_RE = /@param\b/g;
const RETURNS_TAG_RE = /@returns?\b/;
const TEMPLATE_TAG_RE = /@template\b/g;
const THROWS_TAG_RE = /@throws?\b/;
/** Matches `@inheritdoc` — indicates all tags are inherited from the base signature. */
const INHERITDOC_RE = /@inheritdoc\b/i;

/** Returns `true` when `text` is a TSDoc block comment (starts with `/**`). */
function isTsDoc(text: string): boolean {
  return TSDOC_OPEN_RE.test(text.trimStart());
}

/** Returns the number of `@param` tags in the comment text. */
function countParamTags(text: string): number {
  return (text.match(PARAM_TAG_RE) ?? []).length;
}

/** Returns `true` when the comment text contains a `@returns` tag. */
function hasReturnsTag(text: string): boolean {
  return RETURNS_TAG_RE.test(text);
}

/**
 * Returns `true` when the return type text describes `void`, `undefined`,
 * `never`, or `Promise<void>` — none of which need a `@returns` tag.
 *
 * @param returnTypeText - Raw text of the function's return type annotation.
 * @returns `true` if the return type does not need a `@returns` tag.
 */
function isVoidReturn(returnTypeText: string): boolean {
  const t = returnTypeText.replace(/^:\s*/, '').trim();
  return (
    t === 'void' ||
    t === 'undefined' ||
    t === 'never' ||
    t === 'Promise<void>' ||
    t === 'Promise<undefined>'
  );
}

/**
 * Counts the number of generic type parameters declared on a function node.
 * Each one requires a corresponding `@template` tag in the TSDoc.
 *
 * @param node - Function AST node to inspect.
 * @returns Count of `<T>` style type parameters declared on the node.
 */
function countTypeParams(node: Node): number {
  const typeParams = node.childForFieldName('type_parameters');
  // Guard: no type_parameters node means the function has no generic type arguments
  if (!typeParams) return 0;
  // Count only type_parameter children — other children are delimiters
  const typeParamNodes = typeParams.namedChildren.filter((c) => c.type === 'type_parameter');
  return typeParamNodes.length;
}

/**
 * Returns `true` when the given node subtree contains a `throw_statement`.
 * Used to detect functions that throw so `@throws` can be enforced.
 *
 * @param node - Root of the subtree to search.
 * @returns `true` if any descendant node is a `throw_statement`.
 */
function hasThrowStatement(node: Node): boolean {
  // Base case: this node itself is a throw statement
  if (node.type === 'throw_statement') return true;
  // Recurse into children to find any nested throw
  for (const child of node.children) {
    // Bail early as soon as any descendant is a throw
    if (hasThrowStatement(child)) return true;
  }
  return false;
}

/**
 * Returns the node whose `previousNamedSibling` should carry the TSDoc
 * comment.  For exported declarations the comment precedes the
 * `export_statement`, not the declaration itself.
 *
 * @param node - The function or method declaration node.
 * @returns The anchor node to check for a preceding TSDoc comment.
 */
function getAnchorNode(node: Node): Node {
  // Exported declarations are wrapped in an export_statement — the comment precedes the wrapper
  return node.parent?.type === 'export_statement' ? node.parent : node;
}

/**
 * Counts the parameters that require a `@param` tag.
 * `this` pseudo-parameters are excluded (they are a TypeScript typing
 * artefact, not real arguments).
 *
 * @param paramsNode - The `formal_parameters` node, or `null` if absent.
 * @returns Number of documentable parameters.
 */
function countDocableParams(paramsNode: Node | null): number {
  // Guard: no parameters node means nothing to count
  if (!paramsNode) return 0;
  // Filter out `this` pseudo-parameters (TS typing artefacts) and inline
  // comments (e.g. `// eslint-disable-next-line`) which tree-sitter surfaces
  // as named siblings inside the formal_parameters node
  const docableParams = paramsNode.namedChildren.filter((c) => {
    if (c.type === 'comment') return false;
    const name = c.childForFieldName('name') ?? c.childForFieldName('pattern');
    return name?.text !== 'this';
  });
  return docableParams.length;
}

/**
 * Checks a single function or method node for TSDoc completeness.
 * Emits diagnostics for each missing or incomplete documentation element.
 *
 * @param node - The `function_declaration` or `method_definition` node.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function checkFunctionNode(
  node: Node,
  filePath: string,
  severity: Severity,
  out: Diagnostic[],
): void {
  const anchor = getAnchorNode(node);
  const prev = anchor.previousNamedSibling;
  const loc = {
    file: filePath,
    line: node.startPosition.row + 1,
    col: node.startPosition.column + 1,
  };
  const name =
    node.childForFieldName('name')?.text ??
    node.parent?.childForFieldName('name')?.text ??
    '(anonymous)';

  // ── 1. Require a TSDoc comment ────────────────────────────────────────────
  if (prev?.type !== 'comment' || !isTsDoc(prev.text)) {
    out.push({
      ...loc,
      rule: RULE_ID,
      message: `'${name}' is missing a TSDoc comment (\`/** ... */\`)`,
      severity,
    });
    // No comment → @param/@returns checks are moot
    return;
  }

  const commentText = prev.text;

  // @inheritdoc delegates all tag documentation to the inherited signature — no further tag checks needed
  if (INHERITDOC_RE.test(commentText)) return;

  // ── 2. @param coverage ────────────────────────────────────────────────────
  const paramCount = countDocableParams(node.childForFieldName('parameters'));
  const tagCount = countParamTags(commentText);
  // Warn when the comment documents fewer params than the function declares
  if (paramCount > 0 && tagCount < paramCount) {
    out.push({
      ...loc,
      rule: RULE_ID,
      message: `'${name}' has ${paramCount} parameter(s) but TSDoc only documents ${tagCount} with @param`,
      severity,
    });
  }

  // ── 3. @returns for non-void return types ─────────────────────────────────
  const returnType = node.childForFieldName('return_type');
  // Only flag when the return type is non-void and @returns is absent
  if (returnType && !isVoidReturn(returnType.text) && !hasReturnsTag(commentText)) {
    out.push({
      ...loc,
      rule: RULE_ID,
      message: `'${name}' has return type '${returnType.text.replace(/^:\s*/, '')}' but TSDoc is missing @returns`,
      severity,
    });
  }

  // ── 4. @template for generic type parameters ─────────────────────────────
  const typeParamCount = countTypeParams(node);
  const templateTagCount = (commentText.match(TEMPLATE_TAG_RE) ?? []).length;
  // Warn when there are fewer @template tags than declared type parameters
  if (typeParamCount > 0 && templateTagCount < typeParamCount) {
    out.push({
      ...loc,
      rule: RULE_ID,
      message: `'${name}' has ${typeParamCount} type parameter(s) but TSDoc only documents ${templateTagCount} with @template`,
      severity,
    });
  }

  // ── 5. @throws when function contains a throw statement ──────────────────
  // Functions that return `never` are unconditional throwers by definition —
  // the throw behavior is self-evident from the return type, so skip the check.
  const isNeverReturn = returnType?.text.replace(/^:\s*/, '').trim() === 'never';
  const body = node.childForFieldName('body');
  // Only flag when the function actually throws and the comment omits @throws
  if (!isNeverReturn && body && hasThrowStatement(body) && !THROWS_TAG_RE.test(commentText)) {
    out.push({
      ...loc,
      rule: RULE_ID,
      message: `'${name}' contains a throw statement but TSDoc is missing @throws`,
      severity,
    });
  }
}

/**
 * Node types that should carry TSDoc.
 * Arrow functions and anonymous expressions are intentionally excluded
 * to avoid noise on callbacks and short helper closures.
 */
const FUNCTION_TYPES = new Set(['function_declaration', 'method_definition']);

/**
 * Returns `true` when a `function_declaration` is directly wrapped in an
 * `export_statement` (i.e. `export function foo() {}`).
 *
 * @param node - A `function_declaration` node.
 * @returns `true` if the function is directly exported.
 */
function isExportedFunction(node: Node): boolean {
  return node.parent?.type === 'export_statement';
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
 * Returns `true` when a `method_definition` belongs to a class that is
 * directly exported (i.e. `export class Foo { bar() {} }`).
 *
 * @param node - A `method_definition` node.
 * @returns `true` if the containing class is exported.
 */
function isMethodInExportedClass(node: Node): boolean {
  // method_definition → class_body → class_declaration → export_statement
  const classBody = node.parent;
  // Guard: the direct parent must be a class_body node
  if (classBody?.type !== 'class_body') return false;
  const classDecl = classBody.parent;
  // Guard: the class_body's parent must be a class_declaration
  if (classDecl?.type !== 'class_declaration') return false;
  return classDecl.parent?.type === 'export_statement';
}

/**
 * Checks a `class_declaration` node for a TSDoc block comment.
 * Class declarations only require the comment itself — no `@param`/`@returns`
 * checks apply at the class level.
 *
 * @param node - The `class_declaration` node to check.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 */
function checkClassNode(node: Node, filePath: string, severity: Severity, out: Diagnostic[]): void {
  const anchor = getAnchorNode(node);
  const prev = anchor.previousNamedSibling;
  const name = node.childForFieldName('name')?.text ?? '(anonymous)';
  // Require a TSDoc comment block on every class declaration in scope
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
 * Recursively visits every node in the AST and checks functions, methods,
 * and class declarations for TSDoc completeness.
 *
 * @param node - Current AST node being visited.
 * @param filePath - Source file path included in diagnostic output.
 * @param severity - Severity level for each emitted diagnostic.
 * @param out - Accumulator array for collected diagnostics.
 * @param exportedOnly - When `true`, only exported functions are checked.
 * @param classScope - Whether to check all classes or only exported ones.
 */
function walkNode(
  node: Node,
  filePath: string,
  severity: Severity,
  out: Diagnostic[],
  exportedOnly: boolean,
  classScope: 'all' | 'exported',
): void {
  // Check class declarations according to classScope
  if (node.type === 'class_declaration') {
    const shouldCheckClass = classScope === 'all' || isExportedClass(node);
    // Only emit a diagnostic when this class falls within the configured scope
    if (shouldCheckClass) checkClassNode(node, filePath, severity, out);
  }
  // Check function declarations and class methods
  if (FUNCTION_TYPES.has(node.type)) {
    // Object-literal shorthand methods (parent is `object` not `class_body`) implement
    // an interface defined elsewhere — the interface carries the TSDoc, not the implementor.
    const isClassMethod = node.type !== 'method_definition' || node.parent?.type === 'class_body';
    const shouldCheckFn =
      isClassMethod &&
      ((node.type === 'function_declaration' && (!exportedOnly || isExportedFunction(node))) ||
        (node.type === 'method_definition' &&
          (classScope === 'all' || isMethodInExportedClass(node))));
    // Only run the doc check for qualifying nodes
    if (shouldCheckFn) {
      checkFunctionNode(node, filePath, severity, out);
    }
  }
  // Recurse into every child to cover the full AST subtree
  for (const child of node.children) {
    walkNode(child, filePath, severity, out, exportedOnly, classScope);
  }
}

// ── Rule ─────────────────────────────────────────────────────────────────────

/**
 * Options for the `require-tsdoc` rule.
 */
export interface RequireTsDocOptions {
  /**
   * When `true` (default), only exported functions and methods in exported
   * classes require TSDoc.  Set to `false` to enforce TSDoc on all named
   * functions regardless of visibility.
   */
  exportedOnly?: boolean;
  /**
   * Which class declarations require a TSDoc comment.
   * - `'all'` (default): every named class, exported or not.
   * - `'exported'`: only `export class Foo {}` declarations.
   */
  classScope?: 'all' | 'exported';
}

/**
 * Requires all named functions and class methods to have a TSDoc block comment.
 *
 * - `@param` required for each non-`this` parameter.
 * - `@returns` required when the explicit return type is not `void` / `undefined` / `never`.
 *
 * @example Passing
 * ```typescript
 * /**
 *  * Fetches the current user context.
 *  * @param contextId - The context identifier.
 *  * @returns The resolved user context or null.
 *  *\/
 * export function getUserContext(contextId: string): UserContext | null { ... }
 * ```
 *
 * @example Failing
 * ```typescript
 * export function getUserContext(contextId: string): UserContext | null { ... }
 * ```
 */
export function createRequireTsDoc(options: RequireTsDocOptions = {}): Rule {
  const { exportedOnly = true, classScope = 'all' } = options;
  return {
    id: RULE_ID,
    defaultSeverity: DEFAULT_SEVERITY,
    /** @inheritdoc Rule.check */
    check(source: string, filePath: string): Diagnostic[] {
      const tree = tsParser.parse(source);
      // Guard: tsParser.parse returns null for empty or unparseable source
      if (!tree) return [];
      const out: Diagnostic[] = [];
      walkNode(tree.rootNode, filePath, DEFAULT_SEVERITY, out, exportedOnly, classScope);
      return out;
    },
  };
}

/**
 * Pre-built `require-tsdoc` rule with default options (`exportedOnly: true`).
 * Suitable for direct use in a rule array without calling `createRequireTsDoc()`.
 */
export const requireTsDoc: Rule = createRequireTsDoc();
