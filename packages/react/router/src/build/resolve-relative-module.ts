import { stat } from 'node:fs/promises';
import path from 'node:path';

import { isMissingFileError } from './is-missing-file-error.js';

/** Suffixes tried for a relative module specifier, in TypeScript/bundler resolution order. */
const MODULE_SUFFIXES = [
  '',
  '.ts',
  '.tsx',
  '.mts',
  '.js',
  '.jsx',
  '.mjs',
  '/index.ts',
  '/index.tsx',
  '/index.js',
];

/**
 * Resolves a relative module specifier (`./x`, `../x.js`) to an existing file without
 * importing it.
 *
 * TypeScript sources commonly write `./x.js` while the file is `./x.ts`, so a `.js`
 * family extension is also tried with its TypeScript counterparts.
 *
 * @param importer - Absolute path of the module containing the specifier.
 * @param specifier - Relative specifier.
 * @returns The absolute file, or `null` when none exists.
 * @throws {Error} When a candidate exists but cannot be inspected.
 */
export async function resolveRelativeModule(
  importer: string,
  specifier: string,
): Promise<string | null> {
  const base = path.resolve(path.dirname(importer), specifier);
  const stem = base.replace(/\.(?:m|c)?jsx?$/, '');
  // Try the specifier as written first, then each supported source extension
  const candidates = MODULE_SUFFIXES.map((suffix) => `${base}${suffix}`);
  // `./x.js` written for ESM output usually points at `./x.ts` in sources
  if (stem !== base) candidates.push(`${stem}.ts`, `${stem}.tsx`, `${stem}.mts`);
  // The first existing regular file wins, matching bundler resolution order
  for (const candidate of candidates) {
    try {
      // Folders are skipped; their index files are separate candidates
      if ((await stat(candidate)).isFile()) return candidate;
    } catch (error) {
      // Only missing candidates fall through; other failures must surface
      if (!isMissingFileError(error)) throw error;
    }
  }
  return null;
}
