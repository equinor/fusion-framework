import path from 'node:path';
import type { RouteSchemaEntry } from '../routes/to-route-schema.js';
import { readRouteRegistry } from './read-route-registry.js';
import { collectSitemapEntries } from './collect-sitemap-entries.js';

/** Explicit registry location used when generating a build manifest sitemap. */
interface SitemapOptions {
  /** Application project root. */
  root: string;
  /** Project-relative or absolute registry path. Defaults to `src/routes.ts`. */
  routesFile?: string;
}

/**
 * Generates the manifest's flat routes sitemap from an explicit DSL registry.
 *
 * Registry reading, schema validation and traversal are separate responsibilities.
 * Neither registry nor page code executes; filesystem route discovery is not performed.
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
  const registryFile = path.resolve(options.root, options.routesFile ?? 'src/routes.ts');
  const definition = await readRouteRegistry(registryFile);
  return collectSitemapEntries(definition, registryFile);
}
