import { accessSync, constants } from 'node:fs';
import { access } from 'node:fs/promises';

/** Options for file existence checks. */
type Options = {
  /** If true, throws the underlying error instead of returning false. */
  assert?: boolean;
};

/**
 * Synchronously checks whether a file exists at the given path.
 *
 * @param file - Absolute or relative file path to check.
 * @param options - When `assert` is true, the underlying `ENOENT` error is re-thrown instead of returning `false`.
 * @returns `true` if the file is accessible, `false` otherwise (unless `assert` is set).
 *
 * @example
 * ```ts
 * if (fileExistsSync('tsconfig.json')) {
 *   // file is present
 * }
 * ```
 */
export const fileExistsSync = (file: string, options?: Options) => {
  try {
    accessSync(file, constants.F_OK);
    return true;
  } catch (err) {
    if (options?.assert) {
      throw err;
    }
    return false;
  }
};

/**
 * Asynchronously checks whether a file exists at the given path.
 *
 * @param file - Absolute or relative file path to check.
 * @param options - When `assert` is true, the underlying `ENOENT` error is re-thrown instead of resolving to `false`.
 * @returns A promise that resolves to `true` if the file is accessible, `false` otherwise (unless `assert` is set).
 *
 * @example
 * ```ts
 * if (await fileExists('app.manifest.ts')) {
 *   // file is present
 * }
 * ```
 */
export const fileExists = async (file: string, options?: Options): Promise<boolean> => {
  try {
    await access(file, constants.F_OK);
    return true;
  } catch (err) {
    if (options?.assert) {
      throw err;
    }
    return false;
  }
};
