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
    const expandIssues = (issues: typeof result.error.issues): typeof result.error.issues =>
      issues.flatMap((issue) => {
        // Keep leaf diagnostics intact and expand only union errors.
        if (issue.code !== 'invalid_union') {
          return [issue];
        }
        // Expand candidate branches before selecting the most specific one.
        const branches = issue.errors.map(expandIssues);
        const selectedBranch = branches
          // Prefer the branch with the deepest field path, then the fewest diagnostics.
          .reduce((selected, branch) => {
            const selectedDepth = selected
              // Measure specificity by the deepest nested field path in this branch.
              .reduce((depth, item) => Math.max(depth, item.path.length), 0);
            const branchDepth = branch
              // Measure each candidate by the deepest nested field path it reports.
              .reduce((depth, item) => Math.max(depth, item.path.length), 0);
            return branchDepth > selectedDepth ||
              (branchDepth === selectedDepth && branch.length < selected.length)
              ? branch
              : selected;
          });
        // Zod stores union branch paths relative to the union issue's field path.
        return selectedBranch.map((item) => ({
          ...item,
          path: [...issue.path, ...item.path],
        }));
      });

    throw new InvalidDevServerConfigError(
      // Convert structured issues into field-prefixed messages for the CLI error output.
      expandIssues(result.error.issues).map(
        (issue) => `${issue.path.length > 0 ? issue.path.join('.') : '<root>'}: ${issue.message}`,
      ),
    );
  }

  return result.data as DevServerOptions;
};
