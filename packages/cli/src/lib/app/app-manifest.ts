import type { AppManifest, RouteSchemaEntry } from '@equinor/fusion-framework-module-app';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';
import type { RecursivePartial } from '../utils/types.js';

/**
 * Type representing the application manifest structure used by the Fusion Framework.
 * Imported from the '@equinor/fusion-framework-module-app' package for consistency across modules.
 */
export type { AppManifest } from '@equinor/fusion-framework-module-app';

/**
 * Extended manifest type that allows routes to be RouteNode objects (for TypeScript definitions)
 * or RouteSchemaEntry arrays (for JSON serialization).
 *
 * This type is used in manifest definition files where RouteNode objects can be passed directly.
 * The CLI will serialize RouteNode objects to RouteSchemaEntry arrays when generating the final manifest.
 */
export type AppManifestWithRoutes = Omit<AppManifest, 'routes'> & {
  routes?: RouteSchemaEntry[] | unknown; // unknown allows RouteNode | RouteNode[] from router package
};

/**
 * Function type for loading or modifying an application manifest.
 *
 * @template T - A type extending AppManifest or AppManifestWithRoutes, defaults to AppManifestWithRoutes.
 * @param env - The runtime environment (see '../types').
 * @param args - Object containing the base manifest (`base`) of type T.
 * @returns A partial manifest that will be merged with the base, void if no changes, or a promise resolving to either.
 *
 * Usage: Implement this type to create functions that dynamically adjust the manifest based on environment or other factors.
 *
 * Inline notes:
 * - This type accepts partial manifests that will be merged with the base manifest.
 * - Returning void allows for side-effect-only functions, but returning the manifest is preferred for clarity.
 * - Routes can be RouteNode | RouteNode[] (from router package) or RouteSchemaEntry[] (serialized format).
 */
export type AppManifestFn<T extends AppManifest | AppManifestWithRoutes = AppManifestWithRoutes> = (
  env: RuntimeEnv, // The runtime environment, e.g., 'development', 'production', etc.
  args: { base: T }, // The base manifest to be extended or modified.
) => RecursivePartial<T> | void | Promise<RecursivePartial<T> | void>; // Supports both sync and async manifest generation.

/**
 * Utility to define an application manifest in a type-safe and organized manner.
 *
 * @param fn - A function conforming to AppManifestFn that generates the manifest configuration.
 * @returns The result of the provided function, representing the application manifest.
 *
 * Usage: Use this to encapsulate manifest logic, enabling better maintainability and discoverability for RAG systems.
 *
 * Inline notes:
 * - This function is a higher-order utility for manifest definition, not execution.
 * - It does not invoke the function immediately; it simply returns it for later use.
 * - Helps with static analysis and RAG-based documentation extraction.
 */
export const defineAppManifest = (fn: AppManifestFn) => fn;
