import { type ConfigEnv, loadEnv, type UserConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Loads environment variables for a Vite project based on the provided configuration and environment.
 *
 * @see {@link http://vite.dev/guide/env-and-mode.html#env-files}
 *
 * @param config - The user configuration object, which includes properties such as `root` and `envDir`.
 *   - `root`: The root directory of the project. Defaults to the current working directory if not specified.
 *   - `envDir`: The directory containing environment files. If not specified, defaults to the root directory.
 * @param env - The environment configuration object.
 *   - `mode`: The mode in which the application is running (e.g., 'development', 'production').
 * @returns A record of environment variables prefixed with `FUSION_SPA_`.
 */
export function loadEnvironment(
  config: UserConfig,
  env: ConfigEnv,
  namespace = 'FUSION_SPA_',
): Record<string, string> {
  // resolve the root directory
  const resolvedRoot = resolve(config.root || process.cwd());
  // resolve the environment directory
  const envDir = config.envDir ? resolve(resolvedRoot, config.envDir) : resolvedRoot;
  // load environment variables from the specified directory
  return loadEnv(env.mode, envDir, namespace);
}

export default loadEnvironment;
