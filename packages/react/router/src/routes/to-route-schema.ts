import { Route } from './Route.js';
import { IndexRoute } from './IndexRoute.js';
import { LayoutRoute } from './LayoutRoute.js';
import { PrefixRoute } from './PrefixRoute.js';
import { BaseFileRoute } from './BaseFileRoute.js';

import type { RouteNode, ParamsSchema, SearchSchema, RouterSchema, RouteObject } from '../types.js';
/**
 * Schema entry format for route documentation.
 * Each entry represents a route with its path, description, and optional parameter/search schemas.
 */
export type RouteSchemaEntry =
  | [path: string, description: string]
  | [
      path: string,
      description: string,
      options: {
        params?: ParamsSchema;
        search?: SearchSchema;
      },
    ];

/**
 * Joins two path segments, handling leading/trailing slashes properly.
 * @param prefix - The prefix path
 * @param path - The path to append
 * @returns The joined path (with trailing slashes removed)
 */
function joinPaths(prefix: string, path: string | undefined): string {
  const joinedPath = [prefix.replace(/^\//, ''), path]
    .filter(Boolean)
    .join('/')
    .replace(/\/\//, '/')
    .replace(/\/$/, '');
  return joinedPath.length > 1 ? joinedPath : '/';
}

/**
 * Merges two RouterSchema objects, with routeSchema taking precedence.
 * When routeSchema defines a property, it completely replaces the module property (no merging).
 * @param routeSchema - Schema from route definition (takes precedence)
 * @param moduleSchema - Schema from module export
 * @returns Merged schema
 */
function mergeSchemas(
  routeSchema: RouterSchema | undefined,
  moduleSchema: RouterSchema | undefined,
): RouterSchema {
  const merged: RouterSchema = {};

  merged.description = routeSchema?.description ?? moduleSchema?.description;

  if (routeSchema?.params !== undefined) {
    merged.params = routeSchema.params;
  } else if (moduleSchema?.params !== undefined) {
    merged.params = moduleSchema.params;
  }

  if (routeSchema?.search !== undefined) {
    merged.search = routeSchema.search;
  } else if (moduleSchema?.search !== undefined) {
    merged.search = moduleSchema.search;
  }

  return merged;
}

/**
 * Determines the appropriate loader configuration for a file path.
 * @param importPath - The file path to analyze
 * @returns Loader configuration object
 */
function getLoaderConfig(importPath: string) {
  const isJsx = importPath.endsWith('.tsx') || importPath.endsWith('.jsx');
  return {
    loader: (isJsx
      ? { '.tsx': 'tsx' as const, '.jsx': 'tsx' as const }
      : { '.ts': 'ts' as const }) as Record<string, 'ts' | 'tsx'>,
    jsx: 'transform' as const,
  };
}

/**
 * Loads schema from a module file.
 * Uses @equinor/fusion-imports to handle TypeScript file imports.
 * @param file - The file path to load (can be file:// URL or regular path)
 * @returns Promise resolving to the schema from the module, or undefined if not found
 */
async function loadSchemaFromFile(file: string): Promise<RouterSchema | undefined> {
  // dynamically import fileURLToPath to avoid vite analyze it during server build
  const { fileURLToPath } = await import('node:url');
  const importPath = file.startsWith('file://') ? fileURLToPath(new URL(file)) : file;

  try {
    // Try to import directly first (works for compiled JS files)
    const module = await import(/* @vite-ignore */ importPath);
    if (module.handle && typeof module.handle === 'object') {
      // Module can export handle as RouterHandle (with route property) or RouterSchema
      if ('route' in module.handle && typeof module.handle.route === 'object') {
        return module.handle.route as RouterSchema;
      }
      // Legacy: handle is RouterSchema directly
      return module.handle as RouterSchema;
    }
  } catch {
    // If direct import fails (e.g., TypeScript file), use importScript to transpile
    try {
      // dynamically import importScript to avoid vite analyze it during dev server build
      const { importScript } = await import('@equinor/fusion-imports');
      const module = await importScript<{ handle?: RouterSchema | { route?: RouterSchema } }>(
        importPath,
        getLoaderConfig(importPath),
      );
      if (module.handle && typeof module.handle === 'object') {
        // Module can export handle as RouterHandle (with route property) or RouterSchema
        if ('route' in module.handle && typeof module.handle.route === 'object') {
          return module.handle.route as RouterSchema;
        }
        // Legacy: handle is RouterSchema directly
        return module.handle as RouterSchema;
      }
    } catch {
      // If importScript fails, return undefined
      // This can happen if the file can't be transpiled or has unresolvable dependencies
      return undefined;
    }
  }

  return undefined;
}

/**
 * Converts a RouterSchema to the schema options format for RouteSchemaEntry.
 * @param schema - The router schema to convert
 * @returns Schema options object or undefined if no params/search
 */
function schemaToOptions(schema: RouterSchema): RouteSchemaEntry[2] | undefined {
  const hasParams = schema.params && Object.keys(schema.params).length > 0;
  const hasSearch = schema.search && Object.keys(schema.search).length > 0;

  if (!hasParams && !hasSearch) {
    return undefined;
  }

  const options: RouteSchemaEntry[2] = {};
  if (hasParams && schema.params) {
    options.params = schema.params;
  }
  if (hasSearch && schema.search) {
    options.search = schema.search;
  }

  return options;
}

/**
 * Creates a route schema entry from a merged schema.
 * @param path - The route path
 * @param schema - The merged router schema
 * @returns Route schema entry tuple
 */
function createSchemaEntry(path: string, schema: RouterSchema): RouteSchemaEntry {
  const description = schema.description || '';
  const options = schemaToOptions(schema);
  return options ? [path, description, options] : [path, description];
}

/**
 * Processes a file-based route node (Route or IndexRoute) and returns its schema entry.
 * Loads schema from file if available and merges with route handle.
 * @param node - The file route node to process
 * @param path - The full path for this route
 * @returns Promise resolving to the route schema entry
 */
async function processFileRoute(node: BaseFileRoute, path: string): Promise<RouteSchemaEntry> {
  const moduleSchema =
    typeof node.file === 'string' ? await loadSchemaFromFile(node.file) : undefined;
  const routeSchema = node.handle?.route ?? {};
  const mergedSchema = mergeSchemas(routeSchema, moduleSchema);
  return createSchemaEntry(path, mergedSchema);
}

/**
 * Recursively processes RouteObject array (legacy format) and builds a flat schema array.
 * @param routeObjects - The route objects to process
 * @param currentPath - The current path prefix (built from parent paths)
 * @returns Array of route schema entries
 */
function processRouteObjects(
  routeObjects: RouteObject[],
  currentPath: string = '',
): RouteSchemaEntry[] {
  const result: RouteSchemaEntry[] = [];

  for (const routeObj of routeObjects) {
    // Determine the full path for this route
    let fullPath: string;
    if (routeObj.index) {
      fullPath = currentPath || '/';
    } else if (routeObj.path) {
      fullPath = joinPaths(currentPath, routeObj.path);
    } else {
      fullPath = currentPath;
    }

    const hasPathOrIndex = routeObj.path !== undefined || routeObj.index === true;
    const hasChildren = routeObj.children && routeObj.children.length > 0;
    const schema = routeObj.handle?.route;

    if (hasPathOrIndex) {
      // Only include routes that have a schema, or routes without children
      // Routes with children but no schema are just containers and shouldn't be included
      if (schema) {
        result.push(createSchemaEntry(fullPath, schema));
      } else if (!hasChildren) {
        // Route has a path but no schema and no children - include it
        result.push([fullPath, '']);
      }
    }

    // Process children recursively
    if (routeObj.children && routeObj.children.length > 0) {
      result.push(...processRouteObjects(routeObj.children, fullPath));
    }
  }

  return result;
}

/**
 * Recursively processes route nodes and builds a flat schema array.
 * @param nodes - The route nodes to process
 * @param currentPath - The current path prefix (built from parent prefixes)
 * @returns Promise resolving to array of route schema entries
 */
async function processNodes(
  nodes: RouteNode[],
  currentPath: string = '',
): Promise<RouteSchemaEntry[]> {
  const result: RouteSchemaEntry[] = [];

  for (const node of nodes) {
    if (node instanceof Route || node instanceof IndexRoute) {
      const fullPath = joinPaths(currentPath, node instanceof Route ? node.path : '');
      // Route always extends BaseFileRoute, so it always has handle
      if (BaseFileRoute.isFileRoute(node)) {
        result.push(await processFileRoute(node, fullPath));
      } else {
        // Non-file route - use handle.route directly (shouldn't happen in practice)
        const routeHandle = (node as BaseFileRoute).handle;
        const routeSchema = routeHandle?.route ?? {};
        result.push(createSchemaEntry(fullPath, routeSchema));
      }

      // Process children if any
      if (node instanceof Route && node.children && node.children.length > 0) {
        result.push(...(await processNodes(node.children, fullPath)));
      }
    } else if (node instanceof LayoutRoute || node instanceof PrefixRoute) {
      // Process children if any
      if (node.children && node.children.length > 0) {
        const newPath = joinPaths(currentPath, node instanceof LayoutRoute ? '' : node.path);
        result.push(...(await processNodes(node.children, newPath)));
      }
    }
  }

  return result;
}

/**
 * Type guard to check if the input is an array of RouteObjects (legacy format).
 * RouteObjects don't have a 'kind' property, which distinguishes them from RouteNodes.
 *
 * @param nodes - The value to check
 * @returns True if nodes is an array of RouteObjects, false otherwise
 */
function isRouteObjectArray(nodes: unknown): nodes is RouteObject[] {
  return (
    Array.isArray(nodes) &&
    nodes.every((node) => typeof node === 'object' && node !== null && 'kind' in node === false)
  );
}

/**
 * Converts RouterNodes or RouteObjects to a flat route schema array format.
 * This function traverses the route tree and extracts path, description, and parameter information
 * into a flat array suitable for documentation or API schema generation.
 *
 * Schemas are loaded from page files and merged with any route-level schema overrides.
 * Route-level schemas take precedence over module schemas.
 *
 * Supports both RouteNode format (new) and RouteObject[] format (legacy).
 *
 * @param nodes - Single RouteNode, array of RouteNodes, or array of RouteObjects to convert
 * @returns Promise resolving to array of route schema entries in the format: [path, description, options?]
 *
 * @example
 * ```typescript
 * // New format (RouteNode)
 * const routes = [
 *   index('./home.tsx', { description: 'Home page' }),
 *   prefix('products', [
 *     route(':id', './product.tsx', [], {
 *       description: 'Product details',
 *       params: { id: 'Product identifier' },
 *       search: { sort: 'Sort order' }
 *     })
 *   ])
 * ];
 *
 * const schema = await toRouteSchema(routes);
 * // Returns:
 * // [
 * //   ['/', 'Home page'],
 * //   ['products/:id', 'Product details', {
 * //     params: { id: 'Product identifier' },
 * //     search: { sort: 'Sort order' }
 * //   }]
 * // ]
 *
 * // Legacy format (RouteObject[])
 * const legacyRoutes: RouteObject[] = [
 *   {
 *     path: '/',
 *     handle: { route: { description: 'Home page' } },
 *     lazy: () => import('./home.tsx')
 *   },
 *   {
 *     path: 'products/:id',
 *     handle: {
 *       route: {
 *         description: 'Product details',
 *         params: { id: 'Product identifier' },
 *         search: { sort: 'Sort order' }
 *       }
 *     },
 *     lazy: () => import('./product.tsx')
 *   }
 * ];
 *
 * const schema = await toRouteSchema(legacyRoutes);
 * ```
 */
export async function toRouteSchema(
  nodes: RouteNode | RouteNode[] | RouteObject[],
): Promise<RouteSchemaEntry[]> {
  if (isRouteObjectArray(nodes)) {
    return processRouteObjects(nodes);
  }

  const nodeArray = Array.isArray(nodes) ? (nodes as RouteNode[]) : [nodes as RouteNode];
  return processNodes(nodeArray);
}
