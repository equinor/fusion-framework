import { mkdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

/**
 * Creates a folder that Git ignores, by writing a `.gitignore` containing `*` into it, so files
 * the mock server writes there by default — such as the analytics recording — are not committed
 * by accident.
 *
 * @remarks
 * An existing `.gitignore` in the folder is left unchanged, so a project can choose to commit the
 * folder's contents.
 *
 * @param dir - The folder to create.
 * @returns Resolves when the folder and its `.gitignore` exist.
 * @throws {Error} When the folder or file cannot be written.
 *
 * @example
 * ```typescript
 * await ensureGitIgnoredDir('.fusion-mock');
 * ```
 */
export async function ensureGitIgnoredDir(dir: string): Promise<void> {
  await mkdir(dir, { recursive: true });
  try {
    // `wx` only creates the file, so a project's own ignore rules are kept.
    await writeFile(join(dir, '.gitignore'), '*\n', { flag: 'wx' });
  } catch (error) {
    // An existing .gitignore is the project's choice and is left as it is.
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
  }
}

export default ensureGitIgnoredDir;
