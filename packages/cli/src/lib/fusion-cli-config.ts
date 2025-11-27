import type { Command } from 'commander';

/**
 * A plugin can be either a package name (string) that will be dynamically imported,
 * or a direct plugin registration function.
 */
export type FusionCliPlugin = string | ((program: Command) => void);

/**
 * Plugin configuration that lists plugins to load
 */
export type FusionCliConfig = {
  /** Array of plugin package names or direct plugin functions to load */
  plugins?: FusionCliPlugin[];
};

/**
 * A function type for defining dynamic or static Fusion CLI configuration.
 *
 * @param env - Optional environment object with root directory information
 * @returns The Fusion CLI configuration object, a promise resolving to it, or void if no configuration is provided
 *
 * @remarks
 * This function enables both static and dynamic configuration patterns. It can be used to
 * return a configuration object directly, or to compute it asynchronously (e.g., by reading files or environment variables).
 *
 * @example <caption>Static configuration with package names</caption>
 * ```ts
 * export default defineFusionCli(() => ({
 *   plugins: ['@equinor/fusion-framework-cli-plugin-ai'],
 * }));
 * ```
 *
 * @example <caption>Static configuration with direct imports</caption>
 * ```ts
 * import aiPlugin from '@equinor/fusion-framework-cli-plugin-ai';
 *
 * export default defineFusionCli(() => ({
 *   plugins: [aiPlugin],
 * }));
 * ```
 *
 * @example <caption>Dynamic configuration</caption>
 * ```ts
 * export default defineFusionCli((env) => {
 *   const plugins = ['@equinor/fusion-framework-cli-plugin-ai'];
 *   if (process.env.ENABLE_EXPERIMENTAL_PLUGINS === 'true') {
 *     plugins.push('@equinor/fusion-framework-cli-plugin-experimental');
 *   }
 *   return { plugins };
 * });
 * ```
 */
export type FusionCliConfigFn = (env?: {
  root?: string;
}) => FusionCliConfig | Promise<FusionCliConfig | void> | void;

/**
 * Represents the configuration export for Fusion CLI plugins.
 *
 * This can either be a static configuration object (`FusionCliConfig`) or a function (`FusionCliConfigFn`)
 * that returns the configuration dynamically.
 *
 * @remarks
 * - Enables flexible config authoring for different deployment scenarios
 * - Supports both object and function-based configuration
 */
export type FusionCliConfigExport = FusionCliConfig | FusionCliConfigFn;

/**
 * Utility to define a Fusion CLI configuration function with proper typing.
 *
 * @param fn - A function that returns the Fusion CLI configuration object (either synchronously or asynchronously)
 * @returns The provided configuration function, unchanged
 *
 * @remarks
 * This utility is used to provide type safety and tooling support for Fusion CLI configuration authoring.
 * It is a no-op at runtime, but helps with code completion and documentation for consumers.
 *
 * @example
 * ```ts
 * import { defineFusionCli } from '@equinor/fusion-framework-cli';
 *
 * export default defineFusionCli(() => ({
 *   plugins: ['@equinor/fusion-framework-cli-plugin-ai'],
 * }));
 * ```
 */
export const defineFusionCli = (fn: FusionCliConfigFn) => fn;
