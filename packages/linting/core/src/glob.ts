import { basename } from 'node:path';

/**
 * Converts a glob-style basename pattern (only the `*` wildcard is supported,
 * matching zero or more characters) into a `RegExp` anchored to the full string.
 *
 * @param pattern - A basename pattern, e.g. `'*.schemas.ts'`.
 * @returns A `RegExp` that matches basenames satisfying the pattern.
 */
function patternToRegExp(pattern: string): RegExp {
  // Escape regex-special characters, then turn '*' into a greedy wildcard
  const escaped = pattern.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*');
  return new RegExp(`^${escaped}$`);
}

/**
 * Tests a file path's basename against a list of glob-style basename patterns.
 * Only the `*` wildcard is supported (e.g. `'*.schemas.ts'` matches
 * `'bookmark.schemas.ts'`, `'*-module.ts'` matches `'bookmark-module.ts'`).
 *
 * Shared by {@link createMatcher} (see `matcher.ts`) so path-matching logic
 * lives in exactly one place.
 *
 * @param filePath - Absolute or relative file path.
 * @param patterns - Glob-style basename patterns.
 * @returns `true` if the file's basename matches at least one pattern.
 */
export function matchesBasenamePattern(filePath: string, patterns: readonly string[]): boolean {
  const name = basename(filePath);
  // A pattern without a wildcard is matched as an exact basename for speed
  // check every pattern, matching wildcards as regex and everything else as an exact basename
  return patterns.some((pattern) =>
    pattern.includes('*') ? patternToRegExp(pattern).test(name) : pattern === name,
  );
}
