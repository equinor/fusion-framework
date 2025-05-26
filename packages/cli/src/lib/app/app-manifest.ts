import type { AppManifest } from '@equinor/fusion-framework-module-app';
import type { RuntimeEnv } from '../types';

/**
 * Type representing the application manifest structure used by the Fusion Framework.
 * Imported from the '@equinor/fusion-framework-module-app' package for consistency across modules.
 */
export type { AppManifest } from '@equinor/fusion-framework-module-app';

/**
 * Function type for loading or modifying an application manifest.
 *
 * @template T - A type extending Partial<AppManifest>, defaults to Partial<AppManifest>.
 * @param env - The runtime environment (see '../types').
 * @param args - Object containing the base manifest (`base`) of type T.
 * @returns The modified manifest of type T, a promise resolving to T, or void if no changes are made.
 *
 * Usage: Implement this type to create functions that dynamically adjust the manifest based on environment or other factors.
 *
 * Inline notes:
 * - This type is generic to allow for partial or full manifest overrides.
 * - Returning void allows for side-effect-only functions, but returning the manifest is preferred for clarity.
 */
export type AppManifestFn = <T extends Partial<AppManifest> = Partial<AppManifest>>(
  env: RuntimeEnv, // The runtime environment, e.g., 'development', 'production', etc.
  args: { base: T }, // The base manifest to be extended or modified.
) => T | void | Promise<T | void>; // Supports both sync and async manifest generation.

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
