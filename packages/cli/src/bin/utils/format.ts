/**
 * Utility module for formatting paths in CLI output.
 */
import { relative } from 'node:path';

import chalk from 'chalk';

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
