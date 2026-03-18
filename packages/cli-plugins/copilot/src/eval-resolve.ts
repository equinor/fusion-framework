import { existsSync, readdirSync, statSync } from 'node:fs';
import { basename, dirname, extname, isAbsolute, join, resolve } from 'node:path';

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
 * Prints a CLI resolution error and exits the current process.
 *
 * @param message - Primary error message.
 * @param detail - Optional follow-up detail shown on the next line.
 * @returns This function never returns because the process exits.
 */
function exitWithResolutionError(message: string, detail?: string): never {
  console.error(`❌ ${message}`);
  if (detail) {
    console.error(`   ${detail}`);
  }
  process.exit(1);
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

  if (extname(absInput) !== '.md') {
    return { appPath: absInput };
  }

  if (!existsSync(absInput)) {
    exitWithResolutionError(`Eval file not found: ${absInput}`);
  }

  if (!statSync(absInput).isFile()) {
    exitWithResolutionError(`Eval path is not a file: ${absInput}`);
  }

  const evalDir = dirname(absInput);
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

/**
 * Resolves eval markdown files for a Fusion application.
 *
 * @param appPath - Path to the Fusion application directory
 * @param evalOpt - Value of the `--eval` CLI option (name, path, or `undefined`)
 * @returns Array of absolute paths to eval markdown files
 */
export function resolveEvalFiles(appPath: string, evalOpt?: string): string[] {
  const absApp = resolve(appPath);

  if (!evalOpt) {
    const evalDir = join(absApp, 'eval');
    if (!existsSync(evalDir)) {
      exitWithResolutionError(
        `No eval directory found at ${evalDir}`,
        'Create eval/*.md files or use --eval <file>',
      );
    }
    const files = readdirSync(evalDir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => join(evalDir, f));

    if (files.length === 0) {
      exitWithResolutionError(`No .md files found in ${evalDir}`);
    }
    return files;
  }

  if (isAbsolute(evalOpt) || evalOpt.includes('/') || evalOpt.includes('\\')) {
    const absPath = isAbsolute(evalOpt) ? evalOpt : resolve(evalOpt);
    if (!existsSync(absPath)) {
      exitWithResolutionError(`Eval file not found: ${absPath}`);
    }
    return [absPath];
  }

  const evalFileName = extname(evalOpt) === '.md' ? evalOpt : `${evalOpt}.md`;
  const evalFile = join(absApp, 'eval', evalFileName);
  if (!existsSync(evalFile)) {
    exitWithResolutionError(`Eval file not found: ${evalFile}`);
  }
  return [evalFile];
}
