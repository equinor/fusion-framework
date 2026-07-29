import { type ConfigEnv, loadEnv, type UserConfig } from 'vite';
import { resolve } from 'node:path';

/**
 * Loads environment variables from `.env` files for the Fusion SPA plugin.
 *
 * @remarks
 * Delegates to Vite's {@link https://vite.dev/guide/env-and-mode.html#env-files | loadEnv}
 * using the resolved project root and env directory. Only variables whose
 * name starts with {@link namespace} are returned.
 *
 * Values loaded here override any matching keys produced by
 * {@link PluginOptions.generateTemplateEnv}.
 *
 * @param config - Vite user configuration (`root`, `envDir`).
 * @param env - Vite configuration environment containing the current `mode`.
 * @param namespace - Variable name prefix to filter on.
 * @returns A flat record of matching environment variable names to their string values.
 *
 * @defaultValue namespace — `'FUSION_SPA_'`
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
