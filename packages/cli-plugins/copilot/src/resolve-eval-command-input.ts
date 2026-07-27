import { basename, dirname, extname, resolve } from 'node:path';
import { existsSync, statSync } from 'node:fs';

import { exitWithResolutionError } from './exit-with-resolution-error.js';

/**
 * Normalized positional input for the `copilot app eval` command.
 *
 * When the user passes an application directory, `evalFile` is undefined.
 * When the user passes a direct `eval/*.md` file path, `appPath` is derived
 * from the file location and `evalFile` points to the selected markdown file.
 */
export interface EvalCommandInput {
  /** Absolute path to the Fusion application directory. */
  appPath: string;
  /** Optional absolute path to the directly selected eval markdown file. */
  evalFile?: string;
}

/**
 * Resolves the positional `copilot app eval` argument.
 *
 * Supports both application directory paths and direct paths to markdown files
 * inside an application's `eval/` directory.
 *
 * @param inputPath - Positional CLI argument passed to the eval command.
 * @returns Normalized application path and optional direct eval file path.
 */
export function resolveEvalCommandInput(inputPath: string): EvalCommandInput {
  const absInput = resolve(inputPath);

  // A non-markdown path is treated as the application directory itself
  if (extname(absInput) !== '.md') {
    return { appPath: absInput };
  }

  // The direct eval file path must actually exist on disk
  if (!existsSync(absInput)) {
    exitWithResolutionError(`Eval file not found: ${absInput}`);
  }

  // Reject directories passed off as a direct eval file path
  if (!statSync(absInput).isFile()) {
    exitWithResolutionError(`Eval path is not a file: ${absInput}`);
  }

  const evalDir = dirname(absInput);
  // Direct eval files must live inside an `eval/` directory so appPath can be derived
  if (basename(evalDir) !== 'eval') {
    exitWithResolutionError(
      `Direct eval file path must point to a markdown file inside an eval directory: ${absInput}`,
    );
  }

  return {
    appPath: dirname(evalDir),
    evalFile: absInput,
  };
}
