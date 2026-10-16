import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';

import { DevServerOptionsSchema } from './dev-server-options-schema.js';
import { InvalidDevServerConfigError } from './InvalidDevServerConfigError.js';

/**
 * Validates resolved dev-server options and reports invalid fields with their configuration paths.
 *
 * @param config - Resolved dev-server options to validate.
 * @returns The validated dev-server options.
 * @throws {InvalidDevServerConfigError} When the value does not match the runtime schema.
 */
export const validateDevServerConfig = (config: unknown): DevServerOptions => {
  // Guard before schema parsing so malformed roots receive a specific root-path diagnostic.
  if (config === null || typeof config !== 'object' || Array.isArray(config)) {
    throw new InvalidDevServerConfigError(['<root>: expected an object configuration']);
  }

  const result = DevServerOptionsSchema.safeParse(config);
  // Preserve Zod's field paths so CLI users can locate the invalid setting directly.
  if (!result.success) {
    throw new InvalidDevServerConfigError(
      // Convert structured issues into field-prefixed messages for the CLI error output.
      result.error.issues.map(
        (issue) => `${issue.path.length > 0 ? issue.path.join('.') : '<root>'}: ${issue.message}`,
      ),
    );
  }

  return result.data as DevServerOptions;
};
