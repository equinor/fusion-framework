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
 * Configuration factory function for Fusion AI operations.
 *
 * This helper function provides type safety and consistency for creating AI configuration
 * functions. It accepts a function that returns configuration (either synchronously or
 * asynchronously) and returns it unchanged, providing a typed interface for consumers.
 *
 * @param fn - Function that returns Fusion AI configuration (sync or async)
 * @returns The same configuration function, typed for use with loadFusionAIConfig
 *
 * @example
 * ```ts
 * // fusion-ai.config.ts
 * export default configureFusionAI(async () => ({
 *   apiKey: process.env.OPENAI_API_KEY,
 *   deployment: 'gpt-4',
 * }));
 * ```
 */
export const configureFusionAI = <T extends FusionAIConfig>(fn: () => Promise<T> | T) => fn;

/**
 * Options for loading Fusion AI configuration
 */
export interface LoadFusionAIConfigOptions {
  /** Base directory to resolve the config file from (default: process.cwd()) */
  baseDir?: string;
  /** File extensions to consider when resolving the config file (default: ['.ts', '.mjs', '.js', '.json']) */
  extensions?: string[];
}

/**
 * Loads and resolves Fusion AI configuration from a file.
 *
 * The config file should export a function (via `configureFusionAI`) that returns
 * the configuration object. The function can be synchronous or asynchronous.
 *
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
  if (typeof configFn === 'function') {
    return await configFn();
  }
  // If config is not a function, treat it as the config object directly
  return configFn as T;
}

export default loadFusionAIConfig;
