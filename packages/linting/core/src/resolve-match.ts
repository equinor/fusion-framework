import type { Rule } from './types.js';
import { createMatcher, type MatcherFn } from './create-matcher.js';

/**
 * Declarative file-matching configuration accepted by every rule factory's
 * `options.match` (see {@link RuleOptions}). Mirrors {@link import('./create-matcher.js').createMatcher}'s
 * `includePatterns`/`excludePatterns` shape, plus an escape hatch (`fn`) for
 * matching logic `include`/`exclude` basename globs can't express.
 *
 * `fn` takes precedence over `include`/`exclude` when both are supplied.
 */
export interface RuleMatchOptions {
  /**
   * Glob-style basename patterns the file must match for the rule to run
   * (only `*` is supported). An empty/omitted list matches every file.
   */
  include?: string[];
  /**
   * Glob-style basename patterns for files to exempt from the rule (only
   * `*` is supported). Takes precedence over `include`.
   */
  exclude?: string[];
  /** Custom matcher, overriding `include`/`exclude` entirely when provided. */
  fn?: MatcherFn;
}

/**
 * Base options shape every rule factory ({@link RuleDef}) must accept.
 * Rule-specific option interfaces extend this with their own fields.
 */
export interface RuleOptions {
  /** File-matching configuration overriding the rule's own default `match`. */
  match?: RuleMatchOptions;
}

/**
 * A rule factory ("initiator") — every rule module exports one of these,
 * named after the rule itself, e.g. `export const noClassComponents: RuleDef = (options) => {...}`.
 *
 * @param options - Rule-specific options, extending {@link RuleOptions}.
 * @returns A configured {@link Rule} instance.
 */
export type RuleDef<TOptions extends RuleOptions = RuleOptions> = (options?: TOptions) => Rule;

/**
 * Resolves a {@link RuleMatchOptions} into a single {@link MatcherFn}, or
 * `undefined` when no match configuration was provided.
 *
 * @param match - Match configuration from a rule factory's `options.match`.
 * @returns A `MatcherFn`, or `undefined` if `match` is absent/empty.
 * @example
 * ```typescript
 * const match = resolveMatch({ exclude: ['index.ts'] });
 * match?.('/src/index.ts'); // false
 * ```
 */
export function resolveMatch(match?: RuleMatchOptions): MatcherFn | undefined {
  // No match config at all means "use the rule's own default"
  if (!match) return undefined;
  // A custom matcher function always overrides include/exclude
  if (match.fn) return match.fn;
  // fall back to building a basename matcher from include/exclude patterns
  if (match.include || match.exclude) {
    return createMatcher(match.include ?? [], match.exclude ?? []);
  }
  return undefined;
}
