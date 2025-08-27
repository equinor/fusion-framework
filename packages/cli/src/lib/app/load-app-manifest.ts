import { importConfig } from '@equinor/fusion-imports';

import type { AppManifest } from '@equinor/fusion-framework-module-app';

import type { RuntimeEnv } from '../types.js';
import type { AppManifestFn } from './app-manifest.js';
import mergeAppManifests from './merge-app-manifest.js';

/**
 * Represents the export type for an application manifest, which can either be
 * a static `AppManifest` object or a function (`AppManifestFn`) that generates
 * an `AppManifest` dynamically based on the runtime environment.
 *
 * Used for both static and dynamic manifest patterns.
 *
 * @public
 */
export type AppManifestExport = AppManifest | AppManifestFn;

/**
 * Options for loading an application manifest file.
 *
 * @template T - The type of the application manifest, extending a partial `AppManifest`.
 * @property base - A base manifest object to merge with the loaded manifest.
 * @property file - The file path of the manifest to load. Defaults to `app.manifest` or environment-specific variants.
 * @property extensions - An array of file extensions to consider when resolving the manifest.
 */
export type LoadAppManifestOptions = {
  base?: AppManifest;
  file?: string | string[];
  extensions?: string[];
};

/**
 * Represents the result of loading an application manifest.
 *
 * @template T - A type extending `Partial<AppManifest>` that represents the structure of the manifest.
 * @property manifest - The loaded application manifest of type `T`.
 * @property path - The file path where the manifest was loaded from.
 * @property extension - The file extension of the manifest file.
 */
type LoadAppManifestResult = {
  manifest: AppManifest;
  path: string;
  extension: string;
};

/**
 * Loads an application manifest file and processes its contents.
 *
 * This function attempts to load a configuration file (defaulting to `app.manifest`) and resolves
 * its contents using a provided script resolver. The manifest can either be a static object
 * or a function that dynamically generates the manifest based on the runtime environment.
 *
 * If the specified file is not found and the runtime environment includes an `environment` property,
 * the function will attempt to load a manifest file specific to that environment (e.g., `app.manifest.<environment>`).
 *
 * @param env - The runtime environment object, containing information such as the root directory and environment name.
 * @param options - Optional parameters for loading the manifest.
 * @returns A promise that resolves to an object containing the loaded manifest, the file path, and the file extension.
 * @throws {FileNotFoundError} If the manifest file cannot be found and no fallback is available.
 * @public
 */
export const loadAppManifest = async (
  env: RuntimeEnv,
  options?: LoadAppManifestOptions,
): Promise<LoadAppManifestResult> => {
  // Suggest config filenames based on environment
  const suggestions = options?.file ?? [
    `app.manifest.${env.environment}`,
    'app.manifest',
    'app.manifest.config',
  ];
  // Use importConfig to dynamically import and resolve the manifest
  const importResult = await importConfig<AppManifest, { default: AppManifestExport }>(
    suggestions,
    {
      baseDir: env.root,
      extensions: options?.extensions,
      script: {
        /**
         * Custom resolver for the imported manifest module.
         *
         * This function determines if the imported module's default export is a function or an object.
         * If it's a function, it is invoked with the runtime environment and the base manifest, allowing
         * for dynamic manifest generation. If it's an object, it is used directly as the manifest.
         *
         * @param module - The imported module containing the manifest export (either function or object).
         * @returns The resolved manifest of type T.
         */
        resolve: async (module) => {
          const base: AppManifest = options?.base ?? ({} as AppManifest); // Use provided base or fallback to empty object
          // If the module's default export is a function, invoke it with the environment and base manifest
          if (typeof module.default === 'function') {
            const result = await module.default(env, { base });
            return mergeAppManifests(base, result ?? {}); // Merge and cast to Record<string, unknown>
          }
          // If the module's default export is not a function, treat it as a manifest object
          return mergeAppManifests(base, module.default ?? {});
        },
      },
    },
  );
  // Return the loaded manifest, file path, and extension for further use
  // Maintainers: This return structure is used by downstream consumers to access the manifest and its metadata
  return {
    manifest: importResult.config,
    path: importResult.path,
    extension: importResult.extension,
  };
};
