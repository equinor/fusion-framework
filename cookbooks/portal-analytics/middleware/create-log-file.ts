import { writeFile } from 'node:fs/promises';

/**
 * Creates an empty log file at the requested path.
 * @param filePath - Path to the log file.
 * @returns A promise that resolves after the file is created.
 */
export const createLogFile = async (filePath: string): Promise<void> => {
  await writeFile(filePath, '', { encoding: 'utf8' });
};
