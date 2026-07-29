import { matchesBasenamePattern } from './matches-basename-pattern.js';

/**
 * A function deciding whether a rule's `check` should run for `filePath`.
 * Assign this to {@link import('./types.js').Rule.match}, or expose it via a
 * rule factory's `options.match` so callers can override the matching
 * strategy entirely from config.
 *
 * @param filePath - Absolute file path being considered for linting.
 * @returns `true` if the rule should run for this file.
 */
export type MatcherFn = (filePath: string) => boolean;

/**
 * Global default {@link MatcherFn} factory for rules that scope themselves to
 * (or exempt themselves from) files by basename (e.g. React-only rules,
 * barrels, co-located schema/module files). Rule factories typically build
 * their default `match` from this, while still honoring an `options.match`
 * override via {@link import('./resolve-match.js').resolveMatch} so callers can tweak the basename
 * patterns or supply an entirely custom `fn` from config.
 *
 * **`excludePatterns` always win.** They are checked first and short-circuit
 * the match entirely — a file excluded here is *never* re-admitted by
 * `includePatterns`, no matter how broad `includePatterns` is (even `['*']`).
 * Only once a file survives `excludePatterns` is it tested against
 * `includePatterns`.
 *
 * @param includePatterns - Glob-style basename patterns the file must match
 *   to be linted (only `*` is supported), see {@link matchesBasenamePattern}.
 *   An empty list (the default) matches every file. Ignored for any file
 *   already rejected by `excludePatterns`.
 * @param excludePatterns - Glob-style basename patterns for files to
 *   **exclude**, checked *before* — and with priority over — `includePatterns`.
 *   An empty list (the default) excludes nothing.
 * @returns A {@link MatcherFn} that returns `false` (skip `check`) when the
 *   file's basename matches any `excludePatterns` entry — regardless of
 *   `includePatterns` — or, failing that, when it fails to match any
 *   `includePatterns` entry while `includePatterns` is non-empty.
 * @example Exclude-only (e.g. exempt barrels from `single-export-per-file`)
 * ```typescript
 * const matcherFn = createMatcher([], ['index.ts', '*.schemas.ts']);
 * matcherFn('/src/index.ts'); // false — excluded, check() is skipped
 * matcherFn('/src/user.ts'); // true — check() runs
 * ```
 * @example Include-only (e.g. scope a React-only rule to `.tsx` files)
 * ```typescript
 * const matcherFn = createMatcher(['*.tsx']);
 * matcherFn('/src/Component.tsx'); // true — check() runs
 * matcherFn('/src/util.ts'); // false — not a match, check() is skipped
 * ```
 * @example Exclude wins over a wide include (e.g. all `.ts` files except barrels)
 * ```typescript
 * const matcherFn = createMatcher(['*.ts'], ['index.ts']);
 * matcherFn('/src/index.ts'); // false — excluded, even though '*.ts' includes it
 * matcherFn('/src/user.ts'); // true — included, not excluded
 * ```
 */
export function createMatcher(
  includePatterns: readonly string[] = [],
  excludePatterns: readonly string[] = [],
): MatcherFn {
  return (filePath: string): boolean => {
    // Exclusions always win, even against a wide/broad includePatterns match
    if (excludePatterns.length > 0 && matchesBasenamePattern(filePath, excludePatterns)) {
      return false;
    }
    // An empty include list means "match everything"
    if (includePatterns.length > 0 && !matchesBasenamePattern(filePath, includePatterns)) {
      return false;
    }
    return true;
  };
}
