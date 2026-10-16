import type { AnyNode, Expression, Identifier, Pattern, Program, VariableDeclarator } from 'acorn';
import { StaticPropertyResolver, type StaticBindingInitializer } from './StaticPropertyResolver.js';

/** Source binding identity; aliases in other lexical scopes remain distinct. */
interface Binding {
  name: string;
  initializers: StaticBindingInitializer[];
  aliases: Set<Binding>;
  primitiveSource?: Binding;
  containers: Set<Expression>;
  written: boolean;
  exposed: boolean;
}

/**
 * Recognizes child objects from an already parsed Acorn syntax tree.
 * @param value - Possible child field, literal value or source location.
 * @returns Whether the value is a parsed syntax node.
 */
function isSyntaxNode(value: unknown): value is AnyNode {
  return (
    typeof value === 'object' &&
    value !== null &&
    'type' in value &&
    typeof value.type === 'string' &&
    'start' in value &&
    typeof value.start === 'number' &&
    'end' in value &&
    typeof value.end === 'number'
  );
}

/**
 * Extracts only binding identifiers, never computed keys or default-value reads.
 * @param pattern - Identifier or destructuring declaration.
 * @returns Identifiers introduced by the pattern.
 */
function getPatternIdentifiers(pattern: Pattern): Identifier[] {
  // Defaults and destructuring introduce bindings through their targets only.
  switch (pattern.type) {
    case 'Identifier':
      return [pattern];
    case 'AssignmentPattern':
      return getPatternIdentifiers(pattern.left);
    case 'RestElement':
      return getPatternIdentifiers(pattern.argument);
    case 'ArrayPattern': {
      const identifiers: Identifier[] = [];
      // Array holes do not declare bindings.
      for (const element of pattern.elements) {
        // Only present elements can introduce names.
        if (element) identifiers.push(...getPatternIdentifiers(element));
      }
      return identifiers;
    }
    case 'ObjectPattern': {
      const identifiers: Identifier[] = [];
      // Property names and computed keys are reads, not declarations.
      for (const property of pattern.properties) {
        identifiers.push(
          ...getPatternIdentifiers(
            property.type === 'RestElement' ? property.argument : property.value,
          ),
        );
      }
      return identifiers;
    }
    default:
      return [];
  }
}

/**
 * Visits Acorn nodes without interpreting source or depending on emitted JS formatting.
 * @param node - Parsed syntax node.
 * @param visit - Visitor receiving the node and its lexical ancestry.
 * @param ancestors - Ancestors accumulated during traversal.
 */
function walkSyntax(
  node: AnyNode,
  visit: (node: AnyNode, ancestors: AnyNode[]) => void,
  ancestors: AnyNode[] = [],
): void {
  visit(node, ancestors);
  const children: unknown[] = Object.values(node);
  // Acorn's child fields vary by syntax; source positions and literals are not nodes.
  for (const child of children) {
    const values: unknown[] = Array.isArray(child) ? child : [child];
    // Array-valued fields include statements, arguments and destructuring patterns.
    for (const value of values) {
      // Only parsed AST objects participate, never literal values or location records.
      if (isSyntaxNode(value)) {
        walkSyntax(value, visit, [...ancestors, node]);
      }
    }
  }
}

/**
 * Rejects mutation or escape of source bindings that contribute to a sitemap.
 *
 * Identity is lexical, so unrelated shadowed variables are not mistaken for route
 * data. Aliases and containing literals propagate potentially mutating uses.
 */
export class StaticBindingGuard {
  private readonly scopes = new Map<AnyNode, Map<string, Binding>>();
  private readonly declarations = new Map<VariableDeclarator, Binding[]>();
  private readonly declarationNames = new Set<Identifier>();
  private readonly references = new Map<Identifier, Binding>();
  private readonly accessors: StaticPropertyResolver;
  private hasDirectEval = false;

  /**
   * @param program - Parsed source module.
   * @param file - Filename for contextual authoring errors.
   * @param builders - Local names of trusted DSL imports.
   */
  constructor(
    private readonly program: Program,
    private readonly file: string,
    private readonly builders: ReadonlySet<string>,
  ) {
    walkSyntax(program, (node, ancestors) => this.indexDeclarations(node, ancestors));
    walkSyntax(program, (node, ancestors) => this.indexUses(node, ancestors));
    this.accessors = new StaticPropertyResolver(
      (reference) => this.references.get(reference)?.initializers ?? [],
    );
    walkSyntax(program, (node) => this.accessors.inspect(node));
  }

  /**
   * Requires a requested module binding and its aliases to remain declarative.
   * @param name - Module-local binding reached during static evaluation.
   * @throws When writes, accessor reads, unknown calls or escaping aliases can change its value.
   */
  assertUnchanged(name: string): void {
    const binding = this.scopes.get(this.program)?.get(name);
    // Imports and missing names are handled by the expression evaluator.
    if (!binding) return;
    const pending = [binding];
    const visited = new Set<Binding>();
    // Follow outward aliases and containers, not unrelated fields of the requested object.
    while (pending.length) {
      const current = pending.pop();
      // Alias cycles need inspecting only once.
      if (!current || visited.has(current)) continue;
      visited.add(current);
      const primitive = this.isPrimitive(current, new Set());
      // A read of a primitive cannot mutate it, but reassignment still changes metadata.
      if (
        this.hasDirectEval ||
        current.written ||
        (!primitive && (current.exposed || this.accessors.hasAccessorRead(current.containers)))
      ) {
        throw new Error(
          `${this.file}: mutable binding '${current.name}' cannot be used in a source-only sitemap. ` +
            'Use literal declarations without writes or untrusted uses, or provide manifest routes directly.',
        );
      }
      // Primitive copies do not share mutable state with their source.
      if (!primitive) pending.push(...current.aliases);
    }
  }

  /**
   * Indexes literal container identities without entering executable function bodies.
   * @param expression - Binding initializer or nested literal value.
   * @param containers - Containers related to the binding.
   */
  private indexContainers(expression: Expression, containers: Set<Expression>): void {
    // Literal descendants can be mutated through member aliases and accessor receivers.
    if (expression.type === 'ObjectExpression') {
      containers.add(expression);
      // Methods and accessor bodies remain opaque.
      for (const property of expression.properties) {
        // Referenced spread containers are linked by their lexical uses.
        if (property.type === 'Property' && property.kind === 'init' && !property.method) {
          this.indexContainers(property.value, containers);
        }
      }
    } else if (expression.type === 'ArrayExpression') {
      containers.add(expression);
      // Array containers can carry objects whose getters are accessed through an alias.
      for (const element of expression.elements) {
        // Holes have no values and spreads are tracked through their source bindings.
        if (element && element.type !== 'SpreadElement') this.indexContainers(element, containers);
      }
    }
  }

  /**
   * Registers a pattern's declarations in their actual lexical scope.
   * @param pattern - Identifier or destructuring pattern.
   * @param scope - Owning lexical scope.
   * @param initializer - Initializer, when the declaration has one.
   * @returns Binding identities introduced by the pattern.
   */
  private declare(pattern: Pattern, scope: AnyNode, initializer?: Expression | null): Binding[] {
    const bindings: Binding[] = [];
    // Pattern traversal excludes initializer expressions and computed key reads.
    for (const node of getPatternIdentifiers(pattern)) {
      this.declarationNames.add(node);
      const names = this.scopes.get(scope) ?? new Map<string, Binding>();
      const binding = names.get(node.name) ?? {
        name: node.name,
        initializers: [],
        aliases: new Set<Binding>(),
        containers: new Set<Expression>(),
        written: false,
        exposed: false,
      };
      // Repeated initialized declarations are writes, not a last-initializer fallback.
      if (initializer) {
        binding.written ||= binding.initializers.length > 0;
        binding.initializers.push({ expression: initializer, pattern, target: node });
        this.indexContainers(initializer, binding.containers);
      }
      names.set(node.name, binding);
      this.scopes.set(scope, names);
      bindings.push(binding);
    }
    return bindings;
  }

  /**
   * Finds the owner of block-scoped or function-scoped declarations.
   * @param ancestors - Lexical ancestry, nearest scope last.
   * @param functionScoped - Whether a var declaration needs hoisting.
   * @returns The owning scope.
   */
  private declarationScope(ancestors: AnyNode[], functionScoped = false): AnyNode {
    // var belongs to the enclosing function; let/const also respect blocks and loops.
    for (const node of ancestors.toReversed()) {
      // Functions, module scope and relevant block constructs establish declaration ownership.
      if (
        node.type === 'Program' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'FunctionExpression' ||
        node.type === 'ArrowFunctionExpression' ||
        node.type === 'StaticBlock' ||
        (!functionScoped &&
          (node.type === 'BlockStatement' ||
            node.type === 'ForStatement' ||
            node.type === 'ForInStatement' ||
            node.type === 'ForOfStatement' ||
            node.type === 'CatchClause' ||
            node.type === 'SwitchStatement'))
      )
        return node;
    }
    return this.program;
  }

  /**
   * Indexes declarations before resolving uses, including hoisted and shadowed names.
   * @param node - Parsed source node.
   * @param ancestors - Lexical ancestry.
   */
  private indexDeclarations(node: AnyNode, ancestors: AnyNode[]): void {
    // Declaration patterns include aliases introduced by destructuring.
    if (node.type === 'VariableDeclaration') {
      const scope = this.declarationScope(ancestors, node.kind === 'var');
      // All declarators share the declaration's lexical owner.
      for (const declaration of node.declarations) {
        const bindings = this.declare(declaration.id, scope, declaration.init);
        this.declarations.set(declaration, bindings);
        const parent = ancestors.at(-1);
        // A loop declaration is assigned by iteration even without an initializer.
        if (
          (parent?.type === 'ForInStatement' || parent?.type === 'ForOfStatement') &&
          parent.left === node
        ) {
          // var loop targets may be the same binding as an exported declaration.
          for (const binding of bindings) binding.written = true;
        }
      }
    } else if (
      node.type === 'FunctionDeclaration' ||
      node.type === 'FunctionExpression' ||
      node.type === 'ArrowFunctionExpression'
    ) {
      // Function declarations bind outside their body; named expressions bind inside it.
      if (node.id)
        this.declare(
          node.id,
          node.type === 'FunctionDeclaration' ? this.declarationScope(ancestors) : node,
        );
      // Parameters shadow module names even when referenced before a local declaration.
      for (const parameter of node.params) this.declare(parameter, node);
    } else if (node.type === 'CatchClause' && node.param) {
      this.declare(node.param, node);
    } else if (node.type === 'ImportDeclaration') {
      // Import identities distinguish trusted DSL builders from local functions of the same name.
      for (const specifier of node.specifiers) this.declare(specifier.local, this.program);
    } else if ((node.type === 'ClassDeclaration' || node.type === 'ClassExpression') && node.id) {
      this.declare(
        node.id,
        node.type === 'ClassDeclaration' ? this.declarationScope(ancestors) : node,
      );
    }
  }

  /**
   * Resolves a reference using lexical identity instead of matching its spelling.
   * @param name - Referenced name.
   * @param ancestors - Lexical ancestry at the use.
   * @returns The nearest binding, when local to this module.
   */
  private resolve(name: string, ancestors: AnyNode[]): Binding | undefined {
    // Inner declarations shadow outer bindings regardless of declaration order.
    for (const scope of ancestors.toReversed()) {
      const binding = this.scopes.get(scope)?.get(name);
      // The first lexical match is the actual referenced binding.
      if (binding) return binding;
    }
    return this.scopes.get(this.program)?.get(name);
  }

  /**
   * Distinguishes value references from property names and declaration syntax.
   * @param node - Identifier to classify.
   * @param parent - Immediately enclosing syntax.
   * @returns Whether the identifier reads or writes a value.
   */
  private isReference(node: Identifier, parent?: AnyNode): boolean {
    // Declaration identifiers and uncomputed property names do not read values.
    if (this.declarationNames.has(node)) return false;
    // These names describe syntax rather than resolving a source binding.
    if (
      parent?.type === 'ImportSpecifier' ||
      parent?.type === 'MetaProperty' ||
      (parent?.type === 'ExportSpecifier' && parent.local !== node) ||
      (parent?.type === 'MemberExpression' && !parent.computed && parent.property === node) ||
      ((parent?.type === 'Property' ||
        parent?.type === 'MethodDefinition' ||
        parent?.type === 'PropertyDefinition') &&
        !parent.computed &&
        parent.key === node &&
        !('value' in parent && parent.value === node))
    )
      return false;
    return true;
  }

  /**
   * Records writes, aliases and uses whose effects cannot be established statically.
   * @param node - Parsed source node.
   * @param ancestors - Lexical ancestry.
   */
  private indexUses(node: AnyNode, ancestors: AnyNode[]): void {
    // Direct eval can rewrite any lexical binding without an AST-visible reference.
    if (
      node.type === 'CallExpression' &&
      node.callee.type === 'Identifier' &&
      node.callee.name === 'eval' &&
      !this.resolve('eval', ancestors)
    )
      this.hasDirectEval = true;
    // Only resolved value identifiers can expose the selected source data.
    if (node.type !== 'Identifier' || !this.isReference(node, ancestors.at(-1))) return;
    const binding = this.resolve(node.name, ancestors);
    // Runtime globals and imports without initializers are not statically evaluated bindings.
    if (!binding) return;
    this.references.set(node, binding);
    let child: AnyNode = node;
    let directTarget = true;
    // Enclosing operations reveal both direct writes and escapes through nested expressions.
    for (const parent of ancestors.toReversed()) {
      // Anonymous literal receivers may carry this binding without a named container alias.
      if (parent.type === 'ObjectExpression' || parent.type === 'ArrayExpression')
        binding.containers.add(parent);
      // Member receivers, computed keys and default values are reads, not target bindings.
      if (
        parent.type === 'MemberExpression' ||
        (parent.type === 'Property' && parent.computed && parent.key === child) ||
        (parent.type === 'AssignmentPattern' && parent.right === child)
      )
        directTarget = false;
      // Local literal containers and aliases may expose the same object under another name.
      if (parent.type === 'VariableDeclarator' && parent.init === child) {
        const aliases = this.declarations.get(parent) ?? [];
        // Alias propagation remains lexical, including nested-scope declarations.
        for (const alias of aliases) {
          binding.aliases.add(alias);
          // Primitive alias chains can be copied safely without sharing mutable state.
          if (parent.init === node) alias.primitiveSource = binding;
        }
      }
      // An unknown callee or method may mutate its receiver or any supplied object.
      if (
        parent.type === 'CallExpression' ||
        parent.type === 'NewExpression' ||
        parent.type === 'TaggedTemplateExpression'
      ) {
        const trusted =
          parent.type === 'CallExpression' &&
          parent.callee.type === 'Identifier' &&
          this.builders.has(parent.callee.name) &&
          this.resolve(parent.callee.name, ancestors) ===
            this.scopes.get(this.program)?.get(parent.callee.name);
        binding.exposed ||= !trusted;
      }
      // Assignments can replace bindings, mutate members or leak references into runtime state.
      if (
        parent.type === 'AssignmentExpression' ||
        parent.type === 'UpdateExpression' ||
        (parent.type === 'UnaryExpression' && parent.operator === 'delete') ||
        ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') &&
          parent.left === child)
      ) {
        binding.written ||=
          directTarget &&
          ((parent.type === 'AssignmentExpression' && parent.left === child) ||
            parent.type === 'UpdateExpression' ||
            parent.type === 'ForInStatement' ||
            parent.type === 'ForOfStatement');
        binding.exposed = true;
      }
      // Returning an object or capturing it in a class field can expose it to runtime mutation.
      if (
        parent.type === 'ReturnStatement' ||
        parent.type === 'YieldExpression' ||
        parent.type === 'AwaitExpression' ||
        parent.type === 'PropertyDefinition' ||
        ((parent.type === 'ForInStatement' || parent.type === 'ForOfStatement') &&
          parent.right === child) ||
        (parent.type === 'AssignmentPattern' && parent.right === child) ||
        (parent.type === 'ArrowFunctionExpression' && parent.body === child)
      )
        binding.exposed = true;
      child = parent;
    }
  }

  /**
   * Recognizes primitive literals and aliases whose reads cannot mutate their value.
   * @param binding - Binding to inspect.
   * @param visited - Alias identities already inspected.
   * @returns Whether the binding resolves to a primitive literal.
   */
  private isPrimitive(binding: Binding, visited: Set<Binding>): boolean {
    // Repeated declarations and cycles cannot establish a stable primitive value.
    if (visited.has(binding) || binding.initializers.length !== 1) return false;
    visited.add(binding);
    const initializer = binding.initializers[0];
    const expression = initializer.expression;
    // Destructuring requires receiver resolution and cannot establish a direct primitive copy here.
    if (initializer.pattern.type !== 'Identifier') return false;
    return (
      (expression.type === 'Literal' && !expression.regex) ||
      (expression.type === 'TemplateLiteral' && expression.expressions.length === 0) ||
      (expression.type === 'Identifier' &&
        !!binding.primitiveSource &&
        this.isPrimitive(binding.primitiveSource, visited))
    );
  }
}
