import path from 'node:path';
import { BaseRoute } from '../routes/BaseRoute.js';
import type { RouterSchema } from '../types.js';
import type { RouteSchemaEntry } from '../routes/to-route-schema.js';
import { readStaticModule } from './read-static-module.js';
import { validateRouteSchema } from './validate-route-schema.js';

/** Mutable state belonging to one registry traversal, never shared between builds. */
interface SitemapContext {
  registryFile: string;
  entries: RouteSchemaEntry[];
  metadataByFile: Map<string, RouterSchema>;
}

/**
 * Reads page schema without importing components, loaders or other runtime exports.
 * @param file - Absolute page or layout filename.
 * @returns Literal handle.route metadata, or an empty schema when not declared.
 * @throws When the module or requested metadata cannot be read statically.
 */
async function readRouteSchema(file: string): Promise<RouterSchema> {
  const module = await readStaticModule(file);
  const handle = module.getExport('handle');
  const metadata = handle && module.getProperty(handle, 'route');
  return metadata ? validateRouteSchema(module.evaluate(metadata), file) : {};
}

/**
 * Traverses authored route nodes in order, resolving page metadata once per file.
 * @param value - A DSL route node or nested array of nodes.
 * @param parentPath - Accumulated application-relative URL.
 * @param context - Per-registry entries, metadata cache and error context.
 * @throws When a node, referenced module or schema is invalid.
 */
async function visitRouteNodes(
  value: unknown,
  parentPath: string,
  context: SitemapContext,
): Promise<void> {
  // Nested arrays preserve authored order without inferring routes from filenames.
  if (Array.isArray(value)) {
    // Await sequentially so module reads cannot reorder emitted entries.
    for (const child of value) await visitRouteNodes(child, parentPath, context);
    return;
  }
  // Structural lookalikes have not passed through the supported DSL builders.
  if (!(value instanceof BaseRoute)) {
    throw new Error(`${context.registryFile}: expected a route DSL node.`);
  }
  const segment = 'path' in value ? value.path : '';
  // Pathless layouts use an empty segment, never a coerced runtime value.
  if (typeof segment !== 'string') {
    throw new Error(`${context.registryFile}: route paths must be strings.`);
  }
  // Preserve the manifest's application-relative format, including the root route.
  const url = [parentPath, segment]
    .filter(Boolean)
    .join('/')
    .replace(/\/+/g, '/')
    .replace(/^\/|\/$/g, '');
  // Prefix nodes contribute URL hierarchy without referencing a page module.
  if ('file' in value) {
    // Source-only resolution must not invoke package or URL module resolution.
    if (typeof value.file !== 'string' || !value.file.startsWith('.')) {
      throw new Error(
        `${context.registryFile}: route modules must use registry-relative file paths.`,
      );
    }
    const moduleFile = path.resolve(path.dirname(context.registryFile), value.file);
    let metadata = context.metadataByFile.get(moduleFile);
    // Reused pages need parsing only once even when mounted at several URLs.
    if (!metadata) {
      metadata = await readRouteSchema(moduleFile);
      context.metadataByFile.set(moduleFile, metadata);
    }
    // Layouts establish nesting but do not become independently navigable entries.
    if (value.kind === 'route' || value.kind === 'index') {
      const handle = 'handle' in value ? value.handle : undefined;
      const inline =
        handle && typeof handle === 'object' && 'route' in handle
          ? validateRouteSchema(handle.route, context.registryFile)
          : {};
      // Inline fields replace their module counterparts, matching the existing DSL.
      const schema = { ...metadata, ...inline };
      // Omit empty maps to preserve the existing two-element tuple representation.
      const options = {
        ...(schema.params && Object.keys(schema.params).length ? { params: schema.params } : {}),
        ...(schema.search && Object.keys(schema.search).length ? { search: schema.search } : {}),
      };
      const entry: RouteSchemaEntry =
        Object.keys(options).length > 0
          ? [url || '/', schema.description ?? '', options]
          : [url || '/', schema.description ?? ''];
      context.entries.push(entry);
    }
  }
  // Child paths inherit the URL accumulated through layouts and prefixes.
  if ('children' in value) await visitRouteNodes(value.children, url, context);
}

/**
 * Flattens an authored DSL tree into the existing serialized manifest sitemap.
 * @param definition - Definition returned by the source-only registry reader.
 * @param registryFile - Registry filename for relative modules and error messages.
 * @returns Sitemap tuples in authored order.
 * @throws When traversal encounters invalid nodes, module paths or metadata.
 */
export async function collectSitemapEntries(
  definition: unknown,
  registryFile: string,
): Promise<RouteSchemaEntry[]> {
  const context: SitemapContext = { registryFile, entries: [], metadataByFile: new Map() };
  await visitRouteNodes(definition, '', context);
  return context.entries;
}
