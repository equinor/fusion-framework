import mergeWith from 'lodash.mergewith';
import type { AppManifest } from '@equinor/fusion-framework-module-app';
import type { RecursivePartial } from '../utils/types.js';

/**
 * Deeply merges two application manifests using lodash's mergeWith.
 *
 * This utility is intended for combining a base manifest with an override manifest,
 * supporting recursive merging of nested properties. It is commonly used in scenarios
 * where environment-specific or user-specific manifest customizations are required.
 *
 * @example
 * ```ts
 * export default defineAppManifest(base => mergeAppManifests(base, { prop: value }));
 * ```
 *
 * @param base - The base manifest to merge with. Typically the default or environment-agnostic manifest.
 * @param overrides - The manifest containing properties to override or extend the base manifest.
 * @returns The deeply merged manifest object.
 *
 * @remarks
 * - Maintainers: This function does not perform schema validation. Ensure validation is handled elsewhere.
 * - Future: Consider adding assertions or schema checks after merging for safety.
 */
export const mergeAppManifests = (
  base: RecursivePartial<AppManifest>, // The base manifest (may be partial)
  overrides: RecursivePartial<AppManifest>, // The overrides to apply (may be partial)
): AppManifest => {
  // Use lodash.mergeWith for deep merging of manifest objects
  const manifest = mergeWith(base, overrides) as AppManifest;
  // TODO: Add assertions or schema validation here if needed
  return manifest;
};

// Export as default for convenience in import statements
export default mergeAppManifests;
