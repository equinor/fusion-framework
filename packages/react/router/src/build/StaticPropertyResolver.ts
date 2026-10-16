import type { AnyNode, Expression, Identifier, Pattern, Super } from 'acorn';

/** A lexical initializer and the declaration target selected from its pattern. */
export interface StaticBindingInitializer {
  expression: Expression;
  pattern: Pattern;
  target: Identifier;
}

interface StaticProperty {
  name: string | undefined;
  receiver: Expression;
  getter: boolean;
  value?: Expression;
}

interface StaticValue {
  expression: Expression;
  properties?: StaticProperty[];
}

/**
 * Tracks getter invocation on actual literal receivers without executing source.
 *
 * Local aliases and destructuring resolve to the same object identities. Copies
 * preserve nested references but convert accessors into opaque data properties.
 */
export class StaticPropertyResolver {
  private readonly invokedReceivers = new Set<Expression>();

  /**
   * @param lookup - Resolves an identifier to its lexical declaration initializers.
   */
  constructor(
    private readonly lookup: (reference: Identifier) => readonly StaticBindingInitializer[],
  ) {}

  /**
   * Records explicit and implicit property reads from parsed application syntax.
   * @param node - A source node after lexical references have been indexed.
   */
  inspect(node: AnyNode): void {
    const active = new Set<Expression>();
    // Each operation resolves its own receiver, never all fields of an enclosing binding.
    if (node.type === 'MemberExpression') {
      this.read(
        this.values(node.object, active),
        this.propertyName(node.property, node.computed),
        active,
      );
    } else if (node.type === 'SpreadElement') {
      this.read(this.values(node.argument, active), undefined, active);
    } else if (node.type === 'VariableDeclarator' && node.init && node.id.type !== 'Identifier') {
      this.bind(node.id, this.values(node.init, active), undefined, active);
    }
  }

  /**
   * Checks whether an accessor was read on a container related to selected metadata.
   * @param containers - Literal containers belonging to the selected binding or its aliases.
   * @returns Whether a source read could execute a getter on one of those containers.
   */
  hasAccessorRead(containers: ReadonlySet<Expression>): boolean {
    // Object identity keeps identically named properties on unrelated receivers separate.
    for (const container of containers) {
      // Only invoked accessors can mutate through `this`.
      if (this.invokedReceivers.has(container)) return true;
    }
    return false;
  }

  /**
   * Resolves literal keys without running computed key expressions.
   * @param key - Object or member key.
   * @param computed - Whether bracket syntax is used.
   * @returns A known name, or undefined for an unknown property.
   */
  private propertyName(key: AnyNode, computed: boolean): string | undefined {
    // Identifier keys are literal only outside bracket syntax.
    if (!computed && key.type === 'Identifier') return key.name;
    // JavaScript uses string names for literal numeric and quoted properties.
    if (key.type === 'Literal') return String(key.value);
    return undefined;
  }

  /**
   * Follows local source values without evaluating getters, calls or imports.
   * @param expression - Receiver expression or local reference.
   * @param active - Expressions already being resolved to prevent alias cycles.
   * @returns Possible literal values; executable values remain opaque.
   */
  private values(expression: Expression | Super, active: Set<Expression>): StaticValue[] {
    // Class inheritance cannot establish a literal source receiver.
    if (expression.type === 'Super') return [];
    // The sitemap evaluator rejects cycles; use analysis must not recurse forever first.
    if (active.has(expression)) return [];
    active.add(expression);
    try {
      // Only source-transparent expressions can establish receiver identity.
      switch (expression.type) {
        case 'Identifier':
          // Resolve each declaration with its actual destructuring target.
          return this.lookup(expression).flatMap((initializer) =>
            this.bind(
              initializer.pattern,
              this.values(initializer.expression, active),
              initializer.target,
              active,
            ),
          );
        case 'MemberExpression':
          return this.read(
            this.values(expression.object, active),
            this.propertyName(expression.property, expression.computed),
            active,
          );
        case 'ChainExpression':
          return this.values(expression.expression, active);
        case 'ConditionalExpression':
          // Either branch may supply the receiver; do not execute its condition to choose one.
          return [
            ...this.values(expression.consequent, active),
            ...this.values(expression.alternate, active),
          ];
        case 'LogicalExpression':
          // Logical operators can return either operand without copying the underlying object.
          return [
            ...this.values(expression.left, active),
            ...this.values(expression.right, active),
          ];
        case 'SequenceExpression':
          return this.values(expression.expressions[expression.expressions.length - 1], active);
        case 'ObjectExpression':
        case 'ArrayExpression':
        case 'Literal':
          return [{ expression }];
        default:
          return [];
      }
    } finally {
      active.delete(expression);
    }
  }

  /**
   * Reads only matching properties on each resolved receiver.
   * @param receivers - Possible literal receivers.
   * @param name - Requested key, or undefined for a spread/unknown key.
   * @param active - Expressions currently being resolved.
   * @returns Statically known data-property values, never getter return values.
   */
  private read(
    receivers: StaticValue[],
    name: string | undefined,
    active: Set<Expression>,
  ): StaticValue[] {
    const result: StaticValue[] = [];
    // Each receiver has independent own-property precedence.
    for (const receiver of receivers) {
      const seen = new Set<string>();
      // Later declarations override earlier ones, including getter/data-property replacements.
      for (const property of this.properties(receiver, active).toReversed()) {
        // Known unrelated keys and overwritten declarations cannot execute this read.
        if (
          (name !== undefined && property.name !== undefined && property.name !== name) ||
          (property.name !== undefined && seen.has(property.name))
        )
          continue;
        // Unknown keys may refer to different properties, so they cannot shadow one another.
        if (property.name !== undefined) seen.add(property.name);
        // Getter results are opaque; only record which actual receiver can be mutated.
        if (property.getter) this.invokedReceivers.add(property.receiver);
        // Data properties preserve source object identity through aliases and containers.
        if (property.value) result.push(...this.values(property.value, active));
        // A known matching key settles an exact read; unknown keys remain alternatives.
        if (name !== undefined && property.name === name) break;
      }
    }
    return result;
  }

  /**
   * Resolves literal own properties, including data copies created by spreads.
   * @param value - Literal value or a previously resolved rest copy.
   * @param active - Expressions currently being resolved.
   * @returns Properties in declaration order, retaining receiver identities.
   */
  private properties(value: StaticValue, active: Set<Expression>): StaticProperty[] {
    // Rest copies already have their filtered data-property view.
    if (value.properties) return value.properties;
    const expression = value.expression;
    // Self-referential spreads cannot be unfolded statically.
    if (active.has(expression)) return [];
    active.add(expression);
    const result: StaticProperty[] = [];
    try {
      // Object members remain tied to the object that actually owns their accessors.
      if (expression.type === 'ObjectExpression') {
        // Spreads copy values, not accessor descriptors.
        for (const property of expression.properties) {
          // Copy source properties without following or executing getter bodies.
          if (property.type === 'SpreadElement') {
            // Multiple source alternatives remain possible for computed UI expressions.
            for (const source of this.values(property.argument, active)) {
              result.push(...this.copy(source, new Set(), active).properties);
            }
          } else {
            result.push({
              name: this.propertyName(property.key, property.computed),
              receiver: expression,
              getter: property.kind === 'get',
              value: property.kind === 'init' ? property.value : undefined,
            });
          }
        }
      } else if (expression.type === 'ArrayExpression') {
        let unknownIndex = false;
        // A spread of an unknown-length collection makes subsequent offsets uncertain.
        for (const [index, element] of expression.elements.entries()) {
          // Preserve every potential element without assigning an incorrect exact offset.
          if (element?.type === 'SpreadElement') {
            unknownIndex = true;
            // Array spreads may carry nested objects whose identity must be preserved.
            for (const source of this.values(element.argument, active)) {
              // Unknown offsets remain candidates for any subsequent indexed read.
              for (const property of this.copy(source, new Set(), active).properties) {
                result.push({ ...property, name: undefined });
              }
            }
          } else {
            result.push({
              name: unknownIndex ? undefined : String(index),
              receiver: expression,
              getter: false,
              value: element ?? undefined,
            });
          }
        }
      }
      return result;
    } finally {
      active.delete(expression);
    }
  }

  /**
   * Models a rest/spread copy without carrying getters onto the new receiver.
   * @param source - Original literal value.
   * @param excluded - Named keys removed by object rest.
   * @param active - Expressions currently being resolved.
   * @param offset - Starting array rest offset, when applicable.
   * @returns A data-property view retaining references to nested source values.
   */
  private copy(
    source: StaticValue,
    excluded: ReadonlySet<string>,
    active: Set<Expression>,
    offset?: number,
  ): StaticValue & { properties: StaticProperty[] } {
    const properties: StaticProperty[] = [];
    const seen = new Set<string>();
    // Rest and spread enumerate effective own properties, not overwritten declarations.
    for (const property of this.properties(source, active).toReversed()) {
      // Excluded, overwritten and earlier array positions do not enter the copy.
      if (
        property.name !== undefined &&
        (excluded.has(property.name) ||
          seen.has(property.name) ||
          (offset !== undefined && Number(property.name) < offset))
      )
        continue;
      // Dynamic keys cannot prove that another declaration has been overwritten.
      if (property.name !== undefined) seen.add(property.name);
      // Accessors execute on the source during copying, never on the resulting data property.
      if (property.getter) this.invokedReceivers.add(property.receiver);
      properties.unshift({
        ...property,
        name:
          offset === undefined || property.name === undefined
            ? property.name
            : String(Number(property.name) - offset),
        getter: false,
        value: property.getter ? undefined : property.value,
      });
    }
    return { expression: source.expression, properties };
  }

  /**
   * Resolves the value assigned to an identifier by a declaration pattern.
   * @param pattern - Identifier, object/array destructuring, rest or default pattern.
   * @param values - Possible values being destructured.
   * @param target - Declaration identifier to select, or undefined to inspect every read.
   * @param active - Expressions currently being resolved.
   * @returns Possible values assigned to the target.
   */
  private bind(
    pattern: Pattern,
    values: StaticValue[],
    target: Identifier | undefined,
    active: Set<Expression>,
  ): StaticValue[] {
    // Pattern syntax describes property reads; initializer/default bodies are not patterns.
    switch (pattern.type) {
      case 'Identifier':
        return target === undefined || pattern === target ? values : [];
      case 'AssignmentPattern':
        return this.bind(
          pattern.left,
          values.length ? values : this.values(pattern.right, active),
          target,
          active,
        );
      case 'RestElement':
        return this.bind(pattern.argument, values, target, active);
      case 'ObjectPattern': {
        const excluded = new Set<string>();
        // Object rest excludes the explicitly destructured keys.
        for (const property of pattern.properties) {
          // Rest itself has no named key to exclude.
          if (property.type === 'Property') {
            const name = this.propertyName(property.key, property.computed);
            // Unknown keys cannot statically exclude a particular property.
            if (name !== undefined) excluded.add(name);
          }
        }
        const result: StaticValue[] = [];
        // Every property is read even when a different target is being resolved.
        for (const property of pattern.properties) {
          // Rest copies data descriptors while named properties read their actual receiver.
          const selected =
            property.type === 'RestElement'
              ? values.map((value) => this.copy(value, excluded, active))
              : this.read(values, this.propertyName(property.key, property.computed), active);
          result.push(
            ...this.bind(
              property.type === 'RestElement' ? property.argument : property.value,
              selected,
              target,
              active,
            ),
          );
        }
        return result;
      }
      case 'ArrayPattern': {
        this.read(values, undefined, active);
        const result: StaticValue[] = [];
        // Array rest keeps the correct offset instead of aliasing the original array's indices.
        for (const [index, element] of pattern.elements.entries()) {
          // Array holes introduce no declarations.
          if (!element) continue;
          // Rest views preserve nested object identity after shifting indices.
          const selected =
            element.type === 'RestElement'
              ? values.map((value) => this.copy(value, new Set(), active, index))
              : this.read(values, String(index), active);
          result.push(...this.bind(element, selected, target, active));
        }
        return result;
      }
      default:
        return [];
    }
  }
}
