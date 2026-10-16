import { normalizePathname } from './normalize-pathname.js';
import { stripTrailingSlashes } from './strip-trailing-slashes.js';

/**
 * Normalizes a basename the way the navigation provider does: collapses
 * consecutive slashes and strips trailing slashes. `'/'` normalizes to `''`
 * (no basename).
 *
 * @param basename - The basename to normalize
 * @returns The normalized basename, or an empty string when none applies
 *
 * @example
 * normalizeBasename("/apps//my-app/") // returns "/apps/my-app"
 */
export const normalizeBasename = (basename: string): string =>
  stripTrailingSlashes(normalizePathname(basename));
