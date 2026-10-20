import type { Expression, Node, ObjectExpression, Property } from 'acorn';
import type { StaticBuilder } from './static-module.types.js';
import type { StaticBindingGuard } from './StaticBindingGuard.js';

/**
 * Resolves the declarative expression subset accepted by manifest sitemaps.
 *
 * Local references are followed, but project imports, getters and arbitrary calls
 * never execute. Cycle tracking is scoped to one evaluator and cleared after errors.
 */
export class StaticExpressionEvaluator {
  private readonly activeExpressions = new Set<Expression>();

  /**
   * @param file - Source filename included in authoring errors.
   * @param bindings - Local variable initializers indexed from the source module.
   * @param builders - Trusted DSL builders indexed by their local import names.
   * @param guard - Rejects writes and unsafe uses of requested source bindings.
   */
  constructor(
    private readonly file: string,
    private readonly bindings: ReadonlyMap<string, Expression>,
    private readonly builders: ReadonlyMap<string, StaticBuilder>,
    private readonly guard: StaticBindingGuard,
  ) {}

  /**
   * Reads one metadata property without evaluating other handle expressions.
   * @param expression - Object literal or local reference to inspect.
   * @param name - Property name to select.
   * @returns The property's source expression, if present.
   * @throws When executable object syntax could affect the requested property.
   */
  getProperty(expression: Expression, name: string): Expression | undefined {
    const object = this.resolveReference(expression);
    // Selecting a property must not invoke a getter or evaluate a runtime object.
    if (object.type !== 'ObjectExpression') this.rejectExpression(object);
    // Last declaration wins, matching JavaScript object literal semantics.
    for (const property of object.properties.toReversed()) {
      // Spreads and computed keys could hide or override the requested property.
      if (property.type !== 'Property' || property.computed) this.rejectExpression(property);
      // Unrelated UI metadata stays unevaluated.
      if (this.getPropertyName(property.key) === name) {
        // Accessors and methods are executable code, not literal metadata.
        if (property.kind !== 'init' || property.method) this.rejectExpression(property);
        return property.value;
      }
    }
    return undefined;
  }

  /**
   * Evaluates literal data and trusted DSL calls, never application code.
   * @param expression - Expression reachable from a registry or route schema.
   * @returns Literal data or the result of a permitted DSL builder.
   * @throws When an expression is unsupported or contains a reference cycle.
   */
  evaluate(expression: Expression): unknown {
    const node = this.resolveReference(expression);
    // Container cycles remain possible after local aliases have been resolved.
    if (this.activeExpressions.has(node)) this.rejectExpression(node);
    this.activeExpressions.add(node);
    try {
      // An explicit syntax whitelist keeps manifest generation source-only.
      switch (node.type) {
        case 'Literal':
          // These values cannot be represented in the JSON manifest schema.
          if (node.regex || node.bigint) this.rejectExpression(node);
          return node.value;
        case 'TemplateLiteral':
          // Interpolation could depend on imported helpers or runtime state.
          if (node.expressions.length) this.rejectExpression(node);
          return node.quasis[0].value.cooked;
        case 'ArrayExpression':
          // Preserve authored ordering without expanding runtime collections.
          return node.elements.map((element) => {
            // Holes and spreads must not silently remove or add routes.
            if (!element || element.type === 'SpreadElement') this.rejectExpression(node);
            return this.evaluate(element);
          });
        case 'ObjectExpression':
          return this.evaluateObject(node);
        case 'CallExpression': {
          const builder = node.callee.type === 'Identifier' && this.builders.get(node.callee.name);
          // Only imported DSL builders may be called, never application helpers.
          if (!builder) this.rejectExpression(node);
          // Nested definitions must satisfy the same source-only restrictions.
          const args = node.arguments.map((argument) => {
            // Spreads would obscure the declared builder signature.
            if (argument.type === 'SpreadElement') this.rejectExpression(argument);
            return this.evaluate(argument);
          });
          return builder(...args);
        }
        default:
          return this.rejectExpression(node);
      }
    } finally {
      this.activeExpressions.delete(node);
    }
  }

  /**
   * Resolves local aliases without following imports or looping indefinitely.
   * @param expression - Literal expression or reference to a local binding.
   * @returns The referenced source expression.
   * @throws When a binding is missing or cyclic.
   */
  private resolveReference(expression: Expression): Expression {
    const visitedNames = new Set<string>();
    // Local aliases are safe to follow; missing bindings may be imports or globals.
    while (expression.type === 'Identifier') {
      this.guard.assertUnchanged(expression.name);
      // Reject alias cycles before they can hang manifest generation.
      if (visitedNames.has(expression.name)) this.rejectExpression(expression);
      visitedNames.add(expression.name);
      const binding = this.bindings.get(expression.name);
      // Imported and runtime values are outside the declarative subset.
      if (!binding) this.rejectExpression(expression);
      expression = binding;
    }
    return expression;
  }

  /**
   * Reads object literals without invoking accessors or changing prototypes.
   * @param expression - Object expression containing literal metadata.
   * @returns The object's evaluated own properties.
   * @throws When a property contains executable or unsupported syntax.
   */
  private evaluateObject(expression: ObjectExpression): Record<string, unknown> {
    const result: Record<string, unknown> = {};
    // Own properties preserve arbitrary metadata keys without prototype mutation.
    for (const property of expression.properties) {
      // Only literal initializer properties can be evaluated without running code.
      if (
        property.type !== 'Property' ||
        property.computed ||
        property.method ||
        property.kind !== 'init'
      ) {
        this.rejectExpression(property);
      }
      Object.defineProperty(result, this.getPropertyName(property.key), {
        value: this.evaluate(property.value),
        enumerable: true,
        configurable: true,
      });
    }
    return result;
  }

  /**
   * Normalizes literal object keys using JavaScript property-name semantics.
   * @param key - Non-computed property key.
   * @returns The property's string name.
   * @throws When a property key cannot be represented statically.
   */
  private getPropertyName(key: Property['key']): string {
    // Unquoted identifiers and quoted literals name the same metadata properties.
    if (key.type === 'Identifier') return key.name;
    // JavaScript coerces numeric and other literal keys to strings.
    if (key.type === 'Literal') return String(key.value);
    return this.rejectExpression(key);
  }

  /**
   * Reports unsupported syntax instead of producing a partial sitemap.
   * @param node - Source node that cannot be resolved statically.
   * @returns Never returns.
   * @throws Always, with filename and unsupported syntax kind.
   */
  private rejectExpression(node: Node): never {
    throw new Error(
      `${this.file}: sitemap requires literal route definitions and metadata; unsupported ${node.type}. ` +
        'Use local constants and index/layout/prefix/route calls, or provide manifest routes directly.',
    );
  }
}
