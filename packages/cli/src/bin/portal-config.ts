import type { RuntimeEnv } from '../lib';
import { writeFile } from '../lib/utils';

import { formatPath, type ConsoleLogger } from './utils';

import { resolveProjectPackage } from './helpers/resolve-project-package.js';
import { resolvePortalConfig } from './helpers/resolve-portal-config.js';

/**
 * Options for generating the portal configuration.
 *
 * This interface defines the shape of the options object accepted by
 * {@link generatePortalConfig}. It allows for optional logging, environment overrides,
 * config file path, and output file path.
 *
 * @public
 */
interface GeneratePortalConfigOptions {
  /**
   * Logger instance for outputting progress and debug information (optional).
   */
  log?: ConsoleLogger | null;
  /**
   * Partial runtime environment overrides (optional).
   */
  env?: Partial<RuntimeEnv>;
  /**
   * Path to the config file to resolve (optional).
   */
  config?: string;
  /**
   * Output file path for writing the generated config (optional).
   */
  output?: string;
}

/**
 * Generates the portal configuration object for the current project.
 *
 * This function resolves the portal package, sets up the runtime environment, resolves the portal config,
 * and optionally writes the config to a file if an output path is provided. Logging is supported for
 * debugging and progress tracking.
 *
 * @param options - Optional settings for logger, environment overrides, config path, and output file.
 * @returns An object containing the generated config and the resolved package info.
 * @throws If writing the config to file fails.
 * @public
 */
export const generatePortalConfig = async (options?: GeneratePortalConfigOptions) => {
  const { log } = options ?? {};
  // Resolve the portal's package.json for root and metadata
  const pkg = await resolveProjectPackage(log);

  // Setup the runtime environment for config resolution
  const env: RuntimeEnv = {
    command: 'build',
    mode: process.env.NODE_ENV ?? 'production',
    root: pkg.root,
    ...options?.env, // Allow overrides from options
  };

  // Resolve the portal config using the environment and config path
  const config = await resolvePortalConfig(env, { log, config: options?.config });
  log?.debug('config:', config);

  // If an output path is provided, write the config to file
  if (options?.output) {
    log?.start('writing config to file');
    try {
      // Write the config as pretty-printed JSON
      await writeFile(options.output, JSON.stringify(config, null, 2));
      log?.succeed('config written successfully', formatPath(options.output, { relative: true }));
    } catch (error) {
      // Log and rethrow errors encountered during file write
      log?.fail('failed to write config');
      throw error;
    }
  }

  // Return the generated config and resolved package info for further use
  return { config, pkg };
};
