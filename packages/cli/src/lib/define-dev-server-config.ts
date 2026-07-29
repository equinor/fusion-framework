import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { RecursivePartial, RuntimeEnv } from './types.js';

/**
 * Type definition for a function that generates or modifies DevServerOptions.
 * @param env - The runtime environment configuration.
 * @param args - An object containing the base DevServerOptions.
 * @returns A DevServerOptions object or a Promise resolving to one, or undefined.
 */
export type DevServerConfigFn = (
  env: RuntimeEnv,
  args: { base: DevServerOptions },
) =>
  | Promise<RecursivePartial<DevServerOptions> | undefined>
  | RecursivePartial<DevServerOptions>
  | undefined;

/**
 * Type definition for a dev server config export, which can be either a DevServerOptions object or a function.
 */
export type DevServerConfigExport = DevServerOptions | DevServerConfigFn;

/**
 * Helper to define a dev server config function with proper typing.
 * @param fn - The configuration function to be used as the dev server config.
 * @returns The same function, typed as DevServerConfigFn.
 */
export const defineDevServerConfig = (fn: DevServerConfigFn) => fn;
