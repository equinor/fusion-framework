import { FileNotFoundError } from '@equinor/fusion-imports';

import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';
import { loadPortalConfig, type PortalConfig } from '@equinor/fusion-framework-cli/portal';

import type { ConsoleLogger } from '../utils/index.js';
import { chalk, formatPath } from '../utils/format.js';

/**
 * Resolves the portal configuration based on the provided runtime environment and options.
 * Handles logging, error reporting, and fallback to built-in config if no local config is found.
 *
 * @param env - The runtime environment containing the command and mode information.
 * @param options - Optional parameters:
 *   - config: Path to a specific configuration file.
 *   - log: Logger utility for progress and status messages.
 * @returns A promise resolving to the loaded portal configuration.
 * @throws If the portal configuration cannot be resolved.
 */
export const resolvePortalConfig = async <T extends PortalConfig = PortalConfig>(
  env: RuntimeEnv,
  options: { config?: string; log?: ConsoleLogger | null },
): Promise<T> => {
  const { log } = options;
  try {
    // Start logging the config creation process
    log?.start('create portal configuration');
    log?.info(
      `generating config with ${chalk.red.dim(env.command)} command in ${chalk.green.dim(env.mode)} mode`,
    );
    // Attempt to load the portal config (from file if specified)
    const result = await loadPortalConfig<T>(env, { file: options?.config });
    // Log success and show the config file path
    log?.succeed('⚙️ generated config from ', formatPath(result.path, { relative: true }));
    return result.config;
  } catch (err) {
    // Handle missing config file error
    if (err instanceof FileNotFoundError) {
      if (options.config) {
        // Warn if a specific config file was requested but not found
        log?.warn(
          `failed to load config file ${formatPath(options.config)}, please check the path.`,
        );
      } else {
        // Fallback to built-in config if no local config is present
        log?.succeed(chalk.dim('⚙️ no local portal config applied, using built-in'));
        return {} as T;
      }
    }
    // Log failure and debug information for other errors
    log?.fail('failed to resolve portal config');
    log?.debug(err);
    throw err;
  }
};
