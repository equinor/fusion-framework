import { existsSync } from 'node:fs';
import { appendFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLogFile } from './create-log-file';

/**
 * Appends one newline-delimited entry to a log file, creating the file when needed.
 * @param filePath - Path to the log file.
 * @param content - Entry to append.
 * @returns A promise that resolves after the entry is written.
 * @throws {Error} When the entry cannot be written.
 */
export const appendFileContents = async (filePath: string, content: string): Promise<void> => {
  const absolutePath = resolve(filePath);
  try {
    // Create the log lazily so appending works on a clean checkout.
    if (!existsSync(absolutePath)) {
      await createLogFile(absolutePath);
    }
    await appendFile(absolutePath, `${content}\n`, 'utf8');
  } catch (error) {
    // Preserve the original filesystem message when reporting a write failure.
    if (error instanceof Error) {
      throw new Error(`Failed to write to file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
