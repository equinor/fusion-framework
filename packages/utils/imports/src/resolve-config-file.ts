import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { FileNotFoundError, processAccessError } from './error.js';

const defaultExtensions = ['.ts', '.mjs', '.js', '.json'];

/**
 * Options accepted by {@link resolveConfigFile}.
 */
export type ResolveConfigFileOptions = {
  /**
   * Base directory for resolving relative basenames.
   * Defaults to `process.cwd()`.
   */
  baseDir?: string;
  /**
   * File extensions to probe, in order. Each extension is appended to the
   * basename and checked for existence.
   * @default ['.ts', '.mjs', '.js', '.json']
   */
  extensions?: string[];
};

/**
 * Resolves the first accessible configuration file for a given basename.
 *
 * The function first checks whether `baseName` itself is an accessible path.
 * If not, it iterates over the configured `extensions` (default:
 * `.ts`, `.mjs`, `.js`, `.json`) and returns the first path that passes an
 * `fs.access` check.
 *
 * When an array of basenames is provided, each is tried in order.
 *
 * @param baseName   - Basename (without extension) or an array of basenames to try.
 * @param options    - Resolution options (base directory, extension list).
 * @returns Absolute path to the first accessible configuration file.
 * @throws {Error} When a basename is not a non-empty string.
 * @throws {FileNotFoundError} When no file matches any basename + extension
 *   combination.
 * @throws {FileNotAccessibleError} When a file exists but is not readable.
 *
 * @example
 * ```typescript
 * const configPath = await resolveConfigFile('app.config', {
 *   baseDir: '/project',
 *   extensions: ['.ts', '.json'],
 * });
 * ```
 */
export async function resolveConfigFile(
  baseName: string | string[],
  options: ResolveConfigFileOptions = {},
): Promise<string> {
  const { baseDir = process.cwd(), extensions = defaultExtensions } = options;

  const suggestions = Array.isArray(baseName) ? baseName : [baseName];

  for (const suggestion of suggestions) {
    if (typeof suggestion !== 'string' || suggestion.length === 0) {
      throw new Error('baseName must be a non-empty string');
    }
    try {
      await access(suggestion);
      return suggestion;
    } catch (err) {
      const error = processAccessError(err, suggestion);
      if (error instanceof FileNotFoundError === false) {
        // unless the error is a FileNotFoundError, rethrow the error
        throw error;
      }
    }
    for (const ext of extensions) {
      const filePath = resolve(baseDir, `${suggestion}${ext}`);
      try {
        await access(filePath);
        return filePath;
      } catch {
        // Continue to the next extension
      }
    }
    // continue to the next suggestion
  }
  // no suggestion found
  throw new FileNotFoundError(`No configuration file found for basename '${baseName}'`);
}

export default resolveConfigFile;
