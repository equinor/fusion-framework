import { importConfig } from '@equinor/fusion-imports';

/**
 * Base configuration interface for Fusion AI operations.
 *
 * This interface serves as the base type for all Fusion AI configuration objects.
 * Implementations should extend this interface with specific configuration properties
 * relevant to their use case. The configuration is typically created using
 * `configureFusionAI` and loaded via `loadFusionAIConfig`.
 */
export interface FusionAIConfig {
  [key: string]: unknown;
}

/**
 * Configuration factory function for Fusion AI operations
 * @param fn - Function that returns Fusion AI configuration (sync or async)
 * @returns The provided configuration function
 */
export const configureFusionAI = <T extends FusionAIConfig>(fn: () => Promise<T> | T) => fn;

/**
 * Options for loading Fusion AI configuration
 */
export interface LoadFusionAIConfigOptions {
  /** Base directory to resolve the config file from (default: process.cwd()) */
  baseDir?: string;
  /** File extensions to consider when resolving the config file */
  extensions?: string[];
}

/**
 * Loads and resolves Fusion AI configuration from a file.
 *
 * The config file should export a function (via `configureFusionAI`) that returns
 * the configuration object. The function can be synchronous or asynchronous.
 *
 * @param configPath - Path to the config file (default: 'fusion-ai.config.ts')
 * @param options - Optional parameters for loading the configuration
 * @returns Promise resolving to the loaded and executed configuration
 *
 * @example
 * ```ts
 * const config = await loadFusionAIConfig('fusion-ai.config.ts', {
 *   baseDir: process.cwd(),
 * });
 * ```
 */
export async function loadFusionAIConfig<T extends FusionAIConfig = FusionAIConfig>(
  configPath: string = 'fusion-ai.config.ts',
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
  if (typeof configFn === 'function') {
    return await configFn();
  }
  // If config is not a function, treat it as the config object directly
  return configFn as T;
}

export default loadFusionAIConfig;
