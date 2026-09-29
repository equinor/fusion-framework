import { resolve } from 'node:path';

/**
 * Resolves a virtual test fixture path from the mocked process working directory.
 *
 * @param path - Relative path used by an import test fixture.
 * @returns Absolute path inside the virtual project directory.
 */
export const testFilePath = (path: string): string => resolve(process.cwd(), path);
