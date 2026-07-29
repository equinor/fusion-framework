import { statSync } from 'node:fs';

import chalk from 'chalk';
import prettyBytes from 'pretty-bytes';

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
  // String input is treated as a file path — resolve its size on disk first
  if (typeof input === 'string') {
    return formatByteSize(statSync(input).size);
  }
  return chalk.yellowBright(prettyBytes(input));
};
