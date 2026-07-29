import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLogFile } from './create-log-file';

/**
 * Clears a log file, creating it first when the development server has not written one yet.
 * @param filePath - Path to the log file.
 * @returns A promise that resolves after the file is empty.
 * @throws {Error} When the file cannot be cleared.
 */
export const clearFileContents = async (filePath: string): Promise<void> => {
  const absolutePath = resolve(filePath);
  try {
    // Create the log before clearing it so future reads have a file to open.
    if (!existsSync(absolutePath)) {
      await createLogFile(absolutePath);
    }
    await writeFile(absolutePath, '', { encoding: 'utf8' });
  } catch (error) {
    // Preserve the original filesystem message when reporting a clear failure.
    if (error instanceof Error) {
      throw new Error(`Failed to write to file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
