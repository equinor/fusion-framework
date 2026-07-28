import { importConfig } from '@equinor/fusion-imports';
import type { FusionAIConfig } from './fusion-ai-config.js';

/**
 * Options controlling how {@link loadFusionAIConfig} resolves and imports the
 * Fusion AI configuration file.
 */
export interface LoadFusionAIConfigOptions {
  /**
   * Base directory used to resolve the config file path.
   *
   * @defaultValue `process.cwd()`
   */
  baseDir?: string;
  /**
   * File extensions tried (in order) when locating the config file.
   *
   * @defaultValue `['.ts', '.mjs', '.js', '.json']`
   */
  extensions?: string[];
}

/**
 * Loads and resolves Fusion AI configuration from a file.
 *
 * The config file should export a function (via `configureFusionAI`) that returns
 * the configuration object. The function can be synchronous or asynchronous.
 *
 * @template T - Shape of the resolved Fusion AI configuration object.
 * @param configPath - Path to the config file without extension (default: 'fusion-ai.config')
 * @param options - Optional parameters for loading the configuration
 * @returns Promise resolving to the loaded and executed configuration
 * @throws {Error} If the config file cannot be found or loaded
 * @throws {Error} If the config file does not export a valid configuration function
 *
 * @example
 * ```ts
 * const config = await loadFusionAIConfig('fusion-ai.config', {
 *   baseDir: process.cwd(),
 *   extensions: ['.ts', '.js'],
 * });
 * ```
 */
export async function loadFusionAIConfig<T extends FusionAIConfig = FusionAIConfig>(
  configPath: string = 'fusion-ai.config',
  options: LoadFusionAIConfigOptions = {},
): Promise<T> {
  const { baseDir = process.cwd(), extensions } = options;

  // Load configuration - config file exports a function for dynamic configuration
  const result = await importConfig<() => Promise<T> | T>(configPath, {
    baseDir,
    extensions,
  });

  // Execute the configuration function (handles both sync and async)
  const configFn = result.config;
  // Config files export a function via configureFusionAI; execute it to resolve the value.
  if (typeof configFn === 'function') {
    return await configFn();
  }
  // If config is not a function, treat it as the config object directly
  return configFn as T;
}

export default loadFusionAIConfig;
