import { blankModuleSource } from './blank-module-source.js';

/** `export * from '...'` (not `export * as x`, not `export type *`); group 1 is the opening quote. */
const STAR_REEXPORT_PATTERN = /\bexport\s*\*\s*from\s*(['"])/g;

/**
 * Lists the module specifiers of value star re-exports (`export * from './x'`).
 *
 * Namespace re-exports (`export * as x from`) bind a single name and type-only
 * re-exports (`export type * from`) carry no runtime exports, so neither is listed.
 *
 * @param source - Module source text.
 * @returns Specifiers in source order.
 */
export function findStarReexports(source: string): string[] {
  const code = blankModuleSource(source);
  const specifiers: string[] = [];
  // The blanked code keeps quote characters in place, so the specifier is read from the source
  for (const match of code.matchAll(STAR_REEXPORT_PATTERN)) {
    const open = match.index + match[0].length;
    const close = code.indexOf(match[1], open);
    // An unterminated specifier is a syntax error that bundlers report themselves
    if (close !== -1) specifiers.push(source.slice(open, close));
  }
  return specifiers;
}
