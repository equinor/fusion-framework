import { importConfig } from '@equinor/fusion-imports';

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

/**
 * Loads a portal schema from configuration files or schema functions.
 *
 * @template T - The type of the portal schema.
 * @param env - The runtime environment used to resolve the schema.
 * @param options - Optional configuration for file names and extensions.
 * @returns An object containing the loaded schema, file path, and extension.
 *
 * This function attempts to import a schema configuration file or function based on the provided environment and options.
 * It supports both direct schema objects and schema factory functions. The schema is resolved and validated before returning.
 */
export const loadPortalSchema = async <T extends PortalSchema>(
  env: RuntimeEnv,
  options?: {
    file?: string | string[];
    extensions?: string[];
  },
) => {
  // Determine possible schema file names based on environment and options
  const suggestions = options?.file ?? [`portal.schema.${env.environment}`, 'portal.schema'];

  // Attempt to import the schema configuration using the importConfig utility
  const importResult = await importConfig(suggestions, {
    baseDir: env.root,
    extensions: options?.extensions,
    script: {
      // Custom resolver to handle both schema objects and schema factory functions
      resolve: async (module: { default: PortalSchemaExport<T> }): Promise<T> => {
        // If the default export is a function, call it with the environment; otherwise, use the object directly
        const result =
          typeof module.default === 'function'
            ? await Promise.resolve(module.default(env))
            : module.default;
        // Validate that a schema was returned
        if (!result) {
          throw new Error('Schema function did not return a valid schema');
        }
        return result as T;
      },
    },
  });
  // Return the loaded schema, along with the file path and extension for reference
  return {
    schema: importResult.config as T,
    path: importResult.path,
    extension: importResult.extension,
  };
};
