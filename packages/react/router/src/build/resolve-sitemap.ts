import path from 'node:path';
import { readStaticModule, type StaticCalls } from './read-static-module.js';
import { index, layout, prefix, route } from '../routes/index.js';
import { BaseRoute } from '../routes/BaseRoute.js';
import type { RouteNode, RouterSchema } from '../types.js';
import type { RouteSchemaEntry } from '../routes/to-route-schema.js';

/** Explicit registry location used when generating a build manifest sitemap. */
interface SitemapOptions {
  /** Application project root. */
  root: string;
  /** Project-relative or absolute registry path. Defaults to `src/routes.ts`. */
  routesFile?: string;
}

/**
 * Validates source-only route metadata before putting it in the manifest.
 * @param value - Literal route schema.
 * @param file - Source filename used in errors.
 * @returns The validated metadata.
 */
function schema(value: unknown, file: string): RouterSchema {
  // Runtime values cannot be serialized as declarative route metadata.
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`${file}: route schema must be an object literal.`);
  }
  const result: RouterSchema = {};
  const properties: [string, unknown][] = Object.entries(value);
  // Only the existing public sitemap fields belong in generated manifests.
  for (const [key, entry] of properties) {
    // Other handle metadata is not part of the sitemap contract.
    if (key !== 'description' && key !== 'params' && key !== 'search') continue;
    // Descriptions and parameter maps have different JSON shapes.
    if (key === 'description') {
      // Reject invalid metadata rather than emitting a misleading empty label.
      if (typeof entry !== 'string') throw new Error(`${file}: description must be a string.`);
      result.description = entry;
    } else {
      // Parameter descriptions must be named entries, not arrays or primitives.
      if (typeof entry !== 'object' || entry === null || Array.isArray(entry)) {
        throw new Error(`${file}: ${key} must contain string descriptions.`);
      }
      const descriptions: Record<string, string> = {};
      // Preserve parameter names as own properties, including prototype-like names.
      for (const [name, description] of Object.entries(entry)) {
        // Coercion would hide invalid authoring input.
        if (typeof description !== 'string') {
          throw new Error(`${file}: ${key}.${name} must be a string.`);
        }
        Object.defineProperty(descriptions, name, { value: description, enumerable: true });
      }
      result[key] = descriptions;
    }
  }
  return result;
}

/**
 * Generates the manifest's flat `routes` sitemap from an explicit DSL registry.
 *
 * Neither the registry nor page modules execute. The registry must default-export
 * (or export `routes`) a declarative tree of index/layout/prefix/route calls.
 * Page `handle.route` metadata and inline route schema overrides are read from
 * source. Filesystem route discovery is intentionally not performed.
 *
 * @param options - Application root and optional registry path.
 * @returns Sitemap entries in the existing manifest route-schema format.
 * @throws When a registry, referenced module or static schema is invalid.
 * @example
 * ```ts
 * const routes = await resolveSitemap({ root: process.cwd(), routesFile: 'src/routes.ts' });
 * ```
 */
export async function resolveSitemap(options: SitemapOptions): Promise<RouteSchemaEntry[]> {
  const file = path.resolve(options.root, options.routesFile ?? 'src/routes.ts');

  /**
   * Rejects non-string DSL arguments instead of coercing malformed declarations.
   * @param value - Source literal.
   * @returns The declared path.
   */
  function string(value: unknown): string {
    // Coercion could turn malformed definitions into unintended URLs.
    if (typeof value !== 'string') throw new Error(`${file}: route paths must be strings.`);
    return value;
  }

  /**
   * Validates child nodes before passing them to the existing route constructors.
   * @param value - Source array.
   * @returns Validated DSL nodes.
   */
  function children(value: unknown): RouteNode[] {
    // Builders must not normalize malformed input into an empty child collection.
    if (!Array.isArray(value)) {
      throw new Error(`${file}: children must be an array of route DSL nodes.`);
    }
    // Only real DSL nodes can establish hierarchy in the sitemap.
    const valid = value.every((node: unknown) => node instanceof BaseRoute);
    // Reject the whole tree rather than emit a partially valid sitemap.
    if (!valid) {
      throw new Error(`${file}: children must be an array of route DSL nodes.`);
    }
    return value;
  }

  const calls: StaticCalls = {
    index: (module, metadata = {}) => index(string(module), schema(metadata, file)),
    layout: (module, nodes) => layout(string(module), children(nodes)),
    prefix: (segment, nodes) => prefix(string(segment), children(nodes)),
    route: (segment, module, nodes = [], metadata = {}) =>
      route(string(segment), string(module), children(nodes), schema(metadata, file)),
  };
  const registry = await readStaticModule(file, calls);
  const exported = registry.exported('default') ?? registry.exported('routes');
  // An unrelated source file must not silently produce an empty sitemap.
  if (!exported) throw new Error(`${file}: expected a default export or a named routes export.`);
  const definition = registry.evaluate(exported);
  const entries: RouteSchemaEntry[] = [];
  const metadataByFile = new Map<string, RouterSchema>();

  /**
   * Traverses only the explicitly authored tree, preserving registry order.
   * @param value - A route node or array of route nodes.
   * @param parent - Accumulated application-relative URL.
   */
  async function visit(value: unknown, parent: string): Promise<void> {
    // Nested arrays preserve authored order without inferring routes from filenames.
    if (Array.isArray(value)) {
      // Await sequentially so module reads cannot reorder emitted entries.
      for (const child of value) await visit(child, parent);
      return;
    }
    // Structural lookalikes have not passed through the supported DSL builders.
    if (!(value instanceof BaseRoute)) {
      throw new Error(`${file}: expected a route DSL node.`);
    }
    const segment = 'path' in value ? value.path : '';
    // Pathless layouts use an empty segment, never a coerced runtime value.
    if (typeof segment !== 'string') throw new Error(`${file}: route paths must be strings.`);
    // Normalize separators while retaining the manifest's application-relative format.
    const url = [parent, segment]
      .filter(Boolean)
      .join('/')
      .replace(/\/+/g, '/')
      .replace(/^\/|\/$/g, '');
    // Prefix nodes contribute URL hierarchy without referencing a page module.
    if ('file' in value) {
      // Source-only resolution must not invoke package or URL module resolution.
      if (typeof value.file !== 'string' || !value.file.startsWith('.')) {
        throw new Error(`${file}: route modules must use registry-relative file paths.`);
      }
      const moduleFile = path.resolve(path.dirname(file), value.file);
      let metadata = metadataByFile.get(moduleFile);
      // Reused pages need parsing only once even if mounted at multiple URLs.
      if (!metadata) {
        const module = await readStaticModule(moduleFile);
        const handle = module.exported('handle');
        const routeMetadata = handle && module.property(handle, 'route');
        metadata = routeMetadata ? schema(module.evaluate(routeMetadata), moduleFile) : {};
        metadataByFile.set(moduleFile, metadata);
      }
      // Layouts establish nesting but are not independently navigable sitemap entries.
      if (value.kind === 'route' || value.kind === 'index') {
        const override = 'handle' in value ? value.handle : undefined;
        const inline =
          override && typeof override === 'object' && 'route' in override
            ? schema(override.route, file)
            : {};
        // Inline schema fields replace their module counterparts, matching the DSL.
        const merged = { ...metadata, ...inline };
        // Omit empty maps to preserve the existing two-element tuple representation.
        const options = {
          ...(merged.params && Object.keys(merged.params).length ? { params: merged.params } : {}),
          ...(merged.search && Object.keys(merged.search).length ? { search: merged.search } : {}),
        };
        const entry: RouteSchemaEntry =
          Object.keys(options).length > 0
            ? [url || '/', merged.description ?? '', options]
            : [url || '/', merged.description ?? ''];
        entries.push(entry);
      }
    }
    // Child paths inherit the URL accumulated through layouts and prefixes.
    if ('children' in value) await visit(value.children, url);
  }

  await visit(definition, '');
  return entries;
}
