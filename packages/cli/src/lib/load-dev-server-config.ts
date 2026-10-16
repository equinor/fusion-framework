import { importConfig, type ImportConfigResult } from '@equinor/fusion-imports';
import type { RecursivePartial, RuntimeEnv } from './types.js';
import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import { mergeDevServerConfig } from './merge-dev-server-config.js';
import type { DevServerConfigExport } from './define-dev-server-config.js';
import { InvalidDevServerConfigError } from './InvalidDevServerConfigError.js';
import { validateDevServerConfig } from './validate-dev-server-config.js';

/**
 * Loads the dev server configuration from a file or function.
 *
 * @param env - The runtime environment configuration.
 * @param base - The base DevServerOptions to use as defaults.
 * @param options - Optional settings for file name and extensions.
 * @returns A promise resolving to the imported and validated config result.
 * @throws {InvalidDevServerConfigError} When loaded values do not produce valid dev-server options.
 *
 * This function uses importConfig to dynamically load the configuration file.
 * If the config export is a function, it is invoked with the environment and a cloned base config.
 * If the config export is an object, it is merged with the base config.
 *
 * Inline comments are provided for maintainability and clarity.
 */
export const loadDevServerConfig = async (
  env: RuntimeEnv,
  base: DevServerOptions,
  options?: {
    file?: string;
    extensions?: string[];
  },
): Promise<ImportConfigResult<DevServerOptions>> => {
  // Resolve script exports to overrides; JSON exports are merged and validated below as well.
  const loaded = await importConfig<RecursivePartial<DevServerOptions>>(
    options?.file ?? 'dev-server.config',
    {
      baseDir: env.root, // Set the base directory for config resolution
      extensions: options?.extensions, // Allow custom file extensions
      script: {
        // Custom resolver for the config module
        resolve: async (module): Promise<RecursivePartial<DevServerOptions>> => {
          const configExport = module.default as DevServerConfigExport;
          // If the default export is a function, call it with env and a cloned base config
          if (typeof configExport === 'function') {
            const baseClone = { ...base }; // Clone base to avoid mutation
            const result = await configExport(env, { base: baseClone });
            return result === undefined ? {} : result;
          }
          return configExport as RecursivePartial<DevServerOptions>;
        },
      },
    },
  );

  // Reject null, arrays, and other non-object exports before merging can obscure their source.
  if (loaded.config === null || typeof loaded.config !== 'object' || Array.isArray(loaded.config)) {
    throw new InvalidDevServerConfigError(['<root>: expected an object configuration']);
  }

  const resolved = mergeDevServerConfig(base, loaded.config);
  return { ...loaded, config: validateDevServerConfig(resolved) };
};
