/**
 * Utility module for formatting paths and byte sizes in CLI output.
 * Exports chalk for consistent styling across CLI tools.
 */
import { relative } from 'node:path';
import { statSync } from 'node:fs';

import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';

export { chalk };

/**
 * Formats a file path for CLI output, with optional relative path and styling.
 *
 * @param path - The file path to format.
 * @param opt - Optional formatting options.
 * @param opt.relative - If true, formats as a relative path from cwd or opt.cwd.
 * @param opt.cwd - The base directory for relative path calculation. Defaults to process.cwd().
 * @returns The formatted file path, styled with chalk.blueBright.
 *
 * @example
 * formatPath('/foo/bar/baz.txt', { relative: true });
 */
export const formatPath = (path: string, opt?: { relative?: boolean; cwd?: string }) => {
  return chalk.blueBright(opt?.relative ? `./${relative(opt?.cwd ?? process.cwd(), path)}` : path);
};

/**
 * Formats a byte size value or file path into a human-readable string for CLI output.
 *
 * If the input is a string, it is treated as a file path and the file size is used.
 * If the input is a number, it is formatted directly.
 *
 * @param input - File path (string) or byte size (number).
 * @returns A formatted string representing the byte size, styled with chalk.yellowBright.
 *
 * @throws If the input is a string and the file does not exist.
 *
 * @example
 * formatByteSize(1024); // '1 kB'
 * formatByteSize('/path/to/file.zip'); // '2.3 MB'
 */
export const formatByteSize = (input: string | number): string => {
  if (typeof input === 'string') {
    return formatByteSize(statSync(input).size);
  }
  return chalk.yellowBright(prettyBytes(input));
};

export default chalk;
