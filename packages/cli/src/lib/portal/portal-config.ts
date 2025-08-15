import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

/**
 * Represents the configuration object for a portal.
 *
 * @remarks
 * This is a placeholder type for the portal configuration. In a real implementation,
 * this should be replaced with a more specific type or interface that describes
 * the shape of your portal's configuration.
 *
 * @example
 * ```ts
 * const config: PortalConfig = {
 *   environment: { name: 'production' },
 *   features: { enableBeta: true },
 * };
 * ```
 */

export type PortalConfig = Record<string, unknown>; // TODO: Replace with a concrete type for portal config

/**
 * A function type for defining dynamic or static portal configuration.
 *
 * @param env - The runtime environment object, providing context such as root directory, environment variables, etc.
 * @param args - An object containing the base portal configuration (useful for merging or extending configs).
 * @returns The portal configuration object, a promise resolving to it, or void if no configuration is provided.
 *
 * @remarks
 * This function enables both static and dynamic configuration patterns. It can be used to
 * return a configuration object directly, or to compute it asynchronously (e.g., by reading files or fetching data).
 *
 * @example <caption>Static configuration</caption>
 * ```ts
 * export const config: PortalConfigFn = (env, { base }) => ({
 *   ...base,
 *   environment: { name: env.environment },
 *   features: { enableBeta: false },
 * });
 * ```
 *
 * @example <caption>Async configuration</caption>
 * ```ts
 * export const config: PortalConfigFn = async (env, { base }) => {
 *   const remoteSettings = await fetchRemoteSettings(env);
 *   return { ...base, ...remoteSettings };
 * };
 * ```
 */
export type PortalConfigFn = (
  config: PortalConfig,
  env: RuntimeEnv,
) => PortalConfig | Promise<PortalConfig | void> | void;

/**
 * Utility to define a portal configuration function for the framework.
 *
 * @param fn - A function that returns the portal configuration object (either synchronously or asynchronously).
 * @returns The provided configuration function, unchanged.
 *
 * @remarks
 * This utility is used to provide type safety and tooling support for portal configuration authoring.
 * It is a no-op at runtime, but helps with code completion and documentation for consumers.
 *
 * @example
 * ```ts
 * import { definePortalConfig } from 'fusion-framework';
 *
 * export default definePortalConfig((env, { base }) => ({
 *   ...base,
 *   environment: { name: env.environment },
 *   features: { enableBeta: true },
 * }));
 * ```
 */
export const definePortalConfig = (fn: PortalConfigFn) => fn;
