import type { DevServerOptions } from '@equinor/fusion-framework-dev-server';
import type { z } from 'zod';

import { DevServerOptionsSchema } from './dev-server-options-schema.js';
import { InvalidDevServerConfigError } from './InvalidDevServerConfigError.js';

type ValidationIssue = z.core.$ZodIssue;

/**
 * Replaces Zod union failures with the diagnostics of the branch the user most likely intended.
 *
 * A branch is selected only when it is strictly more specific than every alternative: the
 * deepest field path first, then the fewest issues. When the best branches tie, no alternative
 * is clearly intended, so the union issue itself is kept and its schema-level message lists
 * every accepted shape instead of misreporting one alternative as the only valid one.
 *
 * @param issues - Issues reported by the dev-server options schema.
 * @returns Issues with unions expanded to their selected branch and absolute field paths.
 */
const expandUnionIssues = (issues: readonly ValidationIssue[]): ValidationIssue[] =>
  issues.flatMap((issue) => {
    // Keep leaf diagnostics intact and expand only union errors.
    if (issue.code !== 'invalid_union') {
      return [issue];
    }
    const ranked = issue.errors
      .map((branch) => {
        const expanded = expandUnionIssues(branch);
        return {
          issues: expanded,
          // Measure specificity by the deepest nested field path in this branch.
          depth: expanded.reduce((depth, item) => Math.max(depth, item.path.length), 0),
        };
      })
      // Deeper paths show how far input matched a branch; fewer diagnostics break depth ties.
      .sort((a, b) => b.depth - a.depth || a.issues.length - b.issues.length);
    const [best, runnerUp] = ranked;
    // Without a single most specific branch, report the union's own accepted-shapes message.
    if (
      !best ||
      (runnerUp && runnerUp.issues.length === best.issues.length && runnerUp.depth === best.depth)
    ) {
      return [issue];
    }
    // Zod stores union branch paths relative to the union issue's field path.
    return best.issues.map((item) => ({ ...item, path: [...issue.path, ...item.path] }));
  });

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
      expandUnionIssues(result.error.issues).map(
        (issue) => `${issue.path.length > 0 ? issue.path.join('.') : '<root>'}: ${issue.message}`,
      ),
    );
  }

  return result.data as DevServerOptions;
};
