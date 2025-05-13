import { access } from 'node:fs/promises';
import { resolve } from 'node:path';

import { FileNotFoundError, processAccessError } from './error.js';

const defaultExtensions = ['.ts', '.mjs', '.js', '.json'];

/**
 * Options for resolving a configuration file.
 *
 * @property {string} [baseDir] - The base directory to start resolving from. If not provided, defaults to the current working directory.
 * @property {string[]} [extensions] - An array of file extensions to consider when resolving the configuration file. If not provided, defaults to common configuration file extensions.
 */
export type ResolveConfigFileOptions = {
  baseDir?: string;
  extensions?: string[];
};

/**
 * Resolves the configuration file path based on the provided base name and options.
 *
 * @param baseName - The base name of the configuration file (without extension).
 * @param options - An object containing optional parameters:
 * @returns A promise that resolves to the path of the found configuration file.
 * @throws Will throw an error if the base name is not a non-empty string.
 * @throws Will throw an error if no configuration file is found with the given base name and extensions.
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
