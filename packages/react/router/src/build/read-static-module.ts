import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import { parse, type Expression, type Node } from 'acorn';
import { transform } from 'esbuild';

/** Literal data and explicitly permitted calls used by a source-only sitemap. */
export interface StaticModule {
  /** Finds a local expression exported under the supplied name. */
  exported(name: string): Expression | undefined;
  /** Reads one property without evaluating unrelated handle properties. */
  property(expression: Expression, key: string): Expression | undefined;
  /** Resolves literals, local bindings and permitted route DSL calls. */
  evaluate(expression: Expression): unknown;
}

/** Route constructors permitted during source-only registry evaluation. */
export type StaticCalls = Readonly<Record<string, (...args: unknown[]) => unknown>>;

/**
 * Parses TypeScript/JSX without executing the module or its imports.
 *
 * Esbuild removes TypeScript and JSX syntax; Acorn supplies the maintained JS
 * parser. Only expressions reachable from the requested export are inspected.
 *
 * @param file - Absolute source module filename.
 * @param calls - Route constructors permitted for recognized DSL imports.
 * @returns Source-only access to exports, object properties and literal values.
 * @throws When source is invalid or a requested expression is not static.
 */
export async function readStaticModule(
  file: string,
  calls: StaticCalls = {},
): Promise<StaticModule> {
  const source = await readFile(file, 'utf8');
  const { code } = await transform(source, {
    loader: /\.[jt]sx$/.test(extname(file)) ? 'tsx' : 'ts',
    format: 'esm',
    sourcefile: file,
  });
  const program = parse(code, { ecmaVersion: 'latest', sourceType: 'module' });
  const bindings = new Map<string, Expression>();
  const exports = new Map<string, Expression>();
  const functions = new Map<string, (...args: unknown[]) => unknown>();
  const active = new Set<Expression>();

  // Imports are never followed: a page or helper cannot execute during manifest generation.
  for (const statement of program.body) {
    // Esbuild lowers exported values into local declarations.
    if (statement.type === 'VariableDeclaration') {
      // Only bindings reachable from requested metadata will be evaluated.
      for (const declaration of statement.declarations) {
        // Destructuring would require a broader expression interpreter.
        if (declaration.id.type === 'Identifier' && declaration.init) {
          bindings.set(declaration.id.name, declaration.init);
        }
      }
    } else if (statement.type === 'ExportNamedDeclaration') {
      // Preserve aliases without importing their defining modules.
      for (const specifier of statement.specifiers) {
        const name =
          specifier.exported.type === 'Identifier'
            ? specifier.exported.name
            : String(specifier.exported.value);
        exports.set(name, specifier.local);
      }
      // Re-exports cannot be resolved without following project imports.
      if (statement.source || statement.declaration) {
        throw new Error(`${file}: sitemap exports must refer to local declarations.`);
      }
    } else if (statement.type === 'ExportAllDeclaration') {
      throw new Error(`${file}: sitemap generation does not support star re-exports.`);
    } else if (
      statement.type === 'ImportDeclaration' &&
      /^@equinor\/fusion-framework-react-(?:router(?:\/routes)?|app\/routing)$/.test(
        String(statement.source.value),
      )
    ) {
      // Aliased named imports must resolve to the same whitelisted DSL builder.
      for (const specifier of statement.specifiers) {
        // Namespace and default imports are outside the declarative subset.
        if (specifier.type === 'ImportSpecifier' && specifier.imported.type === 'Identifier') {
          const builder = Object.hasOwn(calls, specifier.imported.name)
            ? calls[specifier.imported.name]
            : undefined;
          // Unrecognized imports must never become callable source expressions.
          if (builder) functions.set(specifier.local.name, builder);
        }
      }
    }
  }

  /**
   * Reports unsupported source instead of silently dropping routes or metadata.
   * @param node - Expression that cannot be represented statically.
   * @returns Never returns.
   */
  function unsupported(node: Node): never {
    throw new Error(
      `${file}: sitemap requires literal route definitions and metadata; unsupported ${node.type}. ` +
        'Use local constants and index/layout/prefix/route calls, or provide manifest routes directly.',
    );
  }

  /**
   * Follows local constants with cycle detection.
   * @param expression - Literal or reference to resolve.
   * @returns The referenced expression.
   */
  function dereference(expression: Expression): Expression {
    const seen = new Set<string>();
    // Local aliases are safe to follow, but imported values are not evaluated.
    while (expression.type === 'Identifier') {
      // Cycles must fail rather than hang manifest generation.
      if (seen.has(expression.name)) unsupported(expression);
      seen.add(expression.name);
      const binding = bindings.get(expression.name);
      // A missing local binding may be an import or a runtime global.
      if (!binding) unsupported(expression);
      expression = binding;
    }
    return expression;
  }

  /**
   * Selects a property without reading UI-only expressions elsewhere in a handle.
   * @param expression - Object literal or local reference.
   * @param key - Property to select.
   * @returns The property expression, when present.
   */
  function property(expression: Expression, key: string): Expression | undefined {
    const object = dereference(expression);
    // Selecting properties must not invoke getters or evaluate arbitrary objects.
    if (object.type !== 'ObjectExpression') unsupported(object);
    // Last declaration wins, matching JavaScript object literal semantics.
    for (const entry of object.properties.toReversed()) {
      // Spreads and computed keys could hide or override the requested property.
      if (entry.type !== 'Property' || entry.computed) unsupported(entry);
      const name =
        entry.key.type === 'Identifier'
          ? entry.key.name
          : entry.key.type === 'Literal'
            ? entry.key.value
            : unsupported(entry.key);
      // Ignore unrelated UI-only metadata without evaluating it.
      if (name === key) {
        // Accessors and methods are executable code, not literal metadata.
        if (entry.kind !== 'init' || entry.method) unsupported(entry);
        return entry.value;
      }
    }
    return undefined;
  }

  /**
   * Evaluates the deliberately small declarative subset accepted by sitemaps.
   * @param expression - Expression reachable from the registry or route schema.
   * @returns Literal data or a permitted route constructor's result.
   */
  function evaluate(expression: Expression): unknown {
    const node = dereference(expression);
    // Container cycles also need detection after resolving local aliases.
    if (active.has(node)) unsupported(node);
    active.add(node);
    try {
      // The whitelist prevents execution of arbitrary project expressions.
      switch (node.type) {
        case 'Literal':
          // These values cannot be represented in the JSON manifest schema.
          if (node.regex || node.bigint) unsupported(node);
          return node.value;
        case 'TemplateLiteral':
          // Interpolation could depend on runtime state or imported helpers.
          if (node.expressions.length) unsupported(node);
          return node.quasis[0].value.cooked;
        case 'ArrayExpression':
          // Authored ordering is part of the sitemap contract.
          return node.elements.map((element) => {
            // Holes and spreads must not silently drop or expand routes.
            if (!element || element.type === 'SpreadElement') unsupported(node);
            return evaluate(element);
          });
        case 'ObjectExpression': {
          const result: Record<string, unknown> = {};
          // Define own properties so metadata keys cannot modify the prototype.
          for (const entry of node.properties) {
            // Only literal metadata is safe to serialize without executing code.
            if (
              entry.type !== 'Property' ||
              entry.computed ||
              entry.method ||
              entry.kind !== 'init'
            ) {
              unsupported(entry);
            }
            const key =
              entry.key.type === 'Identifier'
                ? entry.key.name
                : entry.key.type === 'Literal'
                  ? entry.key.value
                  : unsupported(entry.key);
            Object.defineProperty(result, String(key), {
              value: evaluate(entry.value),
              enumerable: true,
              configurable: true,
            });
          }
          return result;
        }
        case 'CallExpression': {
          const builder = node.callee.type === 'Identifier' && functions.get(node.callee.name);
          // Only imported DSL builders are callable, never application helpers.
          if (!builder) unsupported(node);
          // Nested DSL calls and literal arguments share the same restrictions.
          const args = node.arguments.map((argument) => {
            // Spread arguments would obscure the declared builder signature.
            if (argument.type === 'SpreadElement') unsupported(argument);
            return evaluate(argument);
          });
          return builder(...args);
        }
        default:
          return unsupported(node);
      }
    } finally {
      active.delete(node);
    }
  }

  return {
    exported: (name) => exports.get(name),
    property,
    evaluate,
  };
}
