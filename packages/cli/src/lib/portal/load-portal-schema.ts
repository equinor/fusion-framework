import type { RuntimeEnv } from '@equinor/fusion-framework-cli/lib';

/**
 * Represents a generic portal schema as a record of key-value pairs.
 */
export type PortalSchema = Record<string, unknown>;

/**
 * A function that returns a portal schema, possibly asynchronously, based on the provided runtime environment.
 * @template T - The type of the portal schema.
 * @param env - The runtime environment used to generate the schema.
 * @returns The portal schema or a promise resolving to the schema.
 */
export type PortalSchemaFn<T extends PortalSchema> = (env: RuntimeEnv) => T | Promise<T> | T;

/**
 * Represents either a portal schema object or a function that returns a portal schema.
 * @template T - The type of the portal schema.
 */
export type PortalSchemaExport<T extends PortalSchema> = T | PortalSchemaFn<T>;

/**
 * Helper to define a portal schema function with type inference.
 * @template T - The type of the portal schema.
 * @param fn - The schema function to define.
 * @returns The provided schema function.
 */
export const definePortalSchema = <T extends PortalSchema>(fn: PortalSchemaFn<T>) => fn;

