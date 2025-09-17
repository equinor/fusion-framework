import { importConfig } from '@equinor/fusion-imports';

import deepmerge from 'deepmerge';

import { PortalManifestSchema } from './portal-manifest.schema.js';
import type { RecursivePartial, RuntimeEnv } from '../types.js';
import type { PortalManifest } from './portal-manifest.js';

/**
 * A function type for generating or modifying a portal manifest based on the runtime environment and provided arguments.
 *
 * @template T - A type extending a partial `PortalManifest`.
 * @param env - The current runtime environment.
 * @param args - An object containing a `base` property, which is a partial portal manifest of type `T`.
 * @returns The resulting portal manifest of type `T`, a promise resolving to `T` or `void`, or `void`.
 */
export type PortalManifestFn<T extends Partial<PortalManifest>> = (
  env: RuntimeEnv,
  args: { base: T },
) => Promise<RecursivePartial<T> | void> | RecursivePartial<T> | void;

/**
 * Represents a value that can either be a partial portal manifest object or a function returning such an object.
 *
 * @typeParam T - A type extending `Partial<PortalManifest>`, representing the shape of the portal manifest.
 *
 * This type is useful for scenarios where a portal manifest can be provided directly as an object,
 * or as a function (possibly asynchronous or parameterized) that returns the manifest object.
 */
export type PortalManifestExport<T extends Partial<PortalManifest>> = T | PortalManifestFn<T>;

/**
 * Represents the result of loading a portal manifest file.
 *
 * @template T - A type extending `Partial<PortalManifest>`, representing the manifest's shape.
 * @property manifest - The loaded manifest object.
 * @property path - The file system path to the manifest file.
 * @property extension - The file extension of the manifest file.
 */
type LoadPortalManifestResult<T extends Partial<PortalManifest>> = {
  manifest: T;
  path: string;
  extension: string;
};

/**
 * Options for loading a portal manifest configuration file.
 *
 * @template T - The type of the portal manifest, extending Partial<PortalManifest>.
 * @property base - An optional base manifest object to merge with the loaded configuration.
 * @property file - A string or array of strings specifying possible manifest file names to load.
 * @property extensions - An array of file extensions to consider when resolving the manifest file.
 */
export type LoadPortalManifestOptions<T extends Partial<PortalManifest>> = {
  base?: T;
  file?: string | string[];
  extensions?: string[];
};

/**
 * Loads a portal manifest configuration file, merging it with optional base values and supporting multiple file extensions.
 *
 * @template T - The type of the portal manifest, extending Partial<PortalManifest>. Defaults to PortalManifest.
 * @param env - The runtime environment containing configuration such as the root directory and environment name.
 * @param options - Optional settings for loading the manifest.
 * @returns A promise that resolves to a `LoadPortalManifestResult<T>` containing the loaded manifest, the file path, and the file extension.
 *
 * This function is the main entry point for loading portal manifest files. It supports merging with a base manifest, custom file name suggestions, and extension filtering.
 *
 * Example usage:
 * ```ts
 * const result = await loadPortalManifest(env, { base: {}, file: 'custom.manifest' });
 * ```
 */
export const loadPortalManifest = async <T extends Partial<PortalManifest> = PortalManifest>(
  env: RuntimeEnv,
  options?: LoadPortalManifestOptions<T>,
): Promise<LoadPortalManifestResult<T>> => {
  // Determine manifest file name suggestions, defaulting to environment-specific and generic names
  const suggestions = options?.file ?? [`portal.manifest.${env.environment}`, 'portal.manifest'];

  // Import the manifest configuration using the provided suggestions and options
  const importResult = await importConfig(suggestions, {
    baseDir: env.root, // Set the base directory for manifest resolution
    extensions: options?.extensions, // Allow custom file extensions if provided
    script: {
      // Custom resolver for manifest modules
      resolve: async (module: { default: PortalManifestExport<T> }): Promise<T> => {
        // Use the provided base manifest or an empty object as the starting point
        const base: T = options?.base ?? ({} as T);
        let overrides: RecursivePartial<T> | undefined;
        // If the manifest export is a function, call it with the environment and base manifest
        if (typeof module.default === 'function') {
          // Await the result of the manifest function, falling back to base if undefined
          overrides = (await module.default(env, { base })) ?? undefined;
        } else {
          // If the manifest export is not a function, treat it as an object
          overrides = module.default as RecursivePartial<T>;
        }
        return overrides ? deepmerge(base, overrides as Partial<T>) : base;
      },
    },
  });

  // Return the loaded manifest, file path, and extension for downstream use
  // Validate the manifest before returning using the PortalManifestSchema (Zod)
  const manifest = importResult.config as T;
  const validation = PortalManifestSchema.safeParse(manifest);
  if (!validation.success) {
    throw new Error(
      `Invalid portal manifest: ${validation.error.issues.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ')}`,
    );
  }
  return {
    manifest,
    path: importResult.path,
    extension: importResult.extension,
  };
};
