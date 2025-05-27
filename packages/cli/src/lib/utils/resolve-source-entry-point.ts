import { fileExistsSync } from './file-exists.js';
import { resolve } from 'node:path';

/**
 * List of default entry point filenames to check for in a source directory.
 * These are commonly used as main files in TypeScript projects.
 */
const ENTRY_POINT_FILES = ['index.ts', 'index.tsx', 'main.ts', 'main.tsx'] as const;

/**
 * Resolves the entry point file from a specified directory.
 *
 * This function searches for the first file that exists from a list of possible entry point filenames
 * within a given directory. If no entry point is found, it throws an error with a helpful message.
 *
 * @param cwd - The current working directory. Defaults to `process.cwd()` if not provided.
 * @param dir - The directory to search within. Defaults to `'src'` if not provided.
 * @param opt - Optional parameters.
 * @param opt.files - An array of filenames to look for. Defaults to ENTRY_POINT_FILES.
 * @returns The resolved entry point file path if found.
 * @throws {Error} If no entry point file is found in the directory.
 */
export const resolveEntryPoint = (
  cwd?: string,
  dir?: string,
  opt?: { files?: string[] },
): string => {
  // Resolve the absolute path to the source directory.
  const sourceDirectory = resolve(cwd ?? process.cwd(), dir ?? 'src');
  // Use provided files or default entry point files.
  const files = opt?.files ?? ENTRY_POINT_FILES;
  // Attempt to find the first file that exists in the directory.
  const entryPoint = files
    .map((file) => resolve(sourceDirectory, file))
    .find((file) => fileExistsSync(file));

  // If no entry point is found, throw an error with details for debugging.
  if (!entryPoint) {
    throw new Error(
      `Unable to resolve entry point, ensure ${files.join(', ')} exists in ${sourceDirectory}`,
    );
  }

  // Return the resolved entry point file path.
  return entryPoint;
};

// Export as default for convenience in import statements.
export default resolveEntryPoint;
