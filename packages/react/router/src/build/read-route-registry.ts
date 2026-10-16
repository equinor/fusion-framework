import { index, layout, prefix, route } from '../routes/index.js';
import { BaseRoute } from '../routes/BaseRoute.js';
import type { RouteNode } from '../types.js';
import { readStaticModule } from './read-static-module.js';
import type { StaticCalls } from './static-module.types.js';
import { validateRouteSchema } from './validate-route-schema.js';

/**
 * Validates declared paths before passing source values into a DSL builder.
 * @param value - Literal path from a route definition.
 * @param file - Registry filename included in authoring errors.
 * @returns The declared path without coercion.
 * @throws When a path is not a string.
 */
function validateRoutePath(value: unknown, file: string): string {
  // Coercion could turn malformed definitions into unintended URLs.
  if (typeof value !== 'string') throw new Error(`${file}: route paths must be strings.`);
  return value;
}

/**
 * Rejects malformed child collections before a DSL builder normalizes them.
 * @param value - Source value supplied as route children.
 * @param file - Registry filename included in authoring errors.
 * @returns The authored DSL child nodes.
 * @throws When the collection contains anything other than real DSL nodes.
 */
function validateRouteChildren(value: unknown, file: string): RouteNode[] {
  // Builders must not normalize invalid input into an empty child collection.
  if (!Array.isArray(value)) {
    throw new Error(`${file}: children must be an array of route DSL nodes.`);
  }
  // Only real DSL nodes can establish hierarchy in the sitemap.
  const valid = value.every((node: unknown): node is BaseRoute => node instanceof BaseRoute);
  // Reject the whole tree rather than emit a partially valid sitemap.
  if (!valid) throw new Error(`${file}: children must be an array of route DSL nodes.`);
  return value;
}

/**
 * Reads a declarative registry using only the existing route DSL builders.
 * @param file - Absolute registry filename.
 * @returns The default or named routes definition, ready for node validation.
 * @throws When an export, builder argument or source expression is invalid.
 */
export async function readRouteRegistry(file: string): Promise<unknown> {
  const calls: StaticCalls = {
    index: (module, schema = {}) =>
      index(validateRoutePath(module, file), validateRouteSchema(schema, file)),
    layout: (module, children) =>
      layout(validateRoutePath(module, file), validateRouteChildren(children, file)),
    prefix: (segment, children) =>
      prefix(validateRoutePath(segment, file), validateRouteChildren(children, file)),
    route: (segment, module, children = [], schema = {}) =>
      route(
        validateRoutePath(segment, file),
        validateRoutePath(module, file),
        validateRouteChildren(children, file),
        validateRouteSchema(schema, file),
      ),
  };
  const registry = await readStaticModule(file, calls);
  const definition = registry.getExport('default') ?? registry.getExport('routes');
  // An unrelated source file must not silently produce an empty sitemap.
  if (!definition) throw new Error(`${file}: expected a default export or a named routes export.`);
  return registry.evaluate(definition);
}
