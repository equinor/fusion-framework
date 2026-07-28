import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { createLogFile } from './create-log-file';

/**
 * Reads a log file, creating an empty file when the development server has not written one yet.
 * @param filePath - Path to the log file.
 * @returns The log file contents.
 * @throws {Error} When the file cannot be read.
 */
export const readFileContents = async (filePath: string): Promise<string> => {
  const absolutePath = resolve(filePath);
  try {
    // Create the log lazily so reads work on a clean checkout.
    if (!existsSync(absolutePath)) {
      await createLogFile(absolutePath);
    }
    return await readFile(absolutePath, 'utf-8');
  } catch (error) {
    // Preserve the original filesystem message when reporting a read failure.
    if (error instanceof Error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
    throw new Error('Unknown error occurred');
  }
};
