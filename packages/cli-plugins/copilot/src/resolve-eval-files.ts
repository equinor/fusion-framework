import { existsSync, readdirSync } from 'node:fs';
import { extname, isAbsolute, join, resolve } from 'node:path';

import { exitWithResolutionError } from './exit-with-resolution-error.js';

/**
 * Resolves eval markdown files for a Fusion application.
 *
 * @param appPath - Path to the Fusion application directory
 * @param evalOpt - Value of the `--eval` CLI option (name, path, or `undefined`)
 * @returns Array of absolute paths to eval markdown files
 */
export function resolveEvalFiles(appPath: string, evalOpt?: string): string[] {
  const absApp = resolve(appPath);

  // No --eval option: run every eval file found in the app's eval/ directory
  if (!evalOpt) {
    const evalDir = join(absApp, 'eval');
    // Fail fast when the application has no eval directory to scan
    if (!existsSync(evalDir)) {
      exitWithResolutionError(
        `No eval directory found at ${evalDir}`,
        'Create eval/*.md files or use --eval <file>',
      );
    }
    const files = readdirSync(evalDir)
      // Keep only markdown files, sorted for stable ordering, resolved to absolute paths
      .filter((f) => f.endsWith('.md'))
      .sort()
      // Resolve each filename to its absolute path within the eval directory
      .map((f) => join(evalDir, f));

    // Surface a clear error instead of silently running zero eval files
    if (files.length === 0) {
      exitWithResolutionError(`No .md files found in ${evalDir}`);
    }
    return files;
  }

  // A path-like --eval value (absolute or containing separators) is a direct file reference
  if (isAbsolute(evalOpt) || evalOpt.includes('/') || evalOpt.includes('\\')) {
    const absPath = isAbsolute(evalOpt) ? evalOpt : resolve(evalOpt);
    // Validate the direct file path exists before returning it
    if (!existsSync(absPath)) {
      exitWithResolutionError(`Eval file not found: ${absPath}`);
    }
    return [absPath];
  }

  const evalFileName = extname(evalOpt) === '.md' ? evalOpt : `${evalOpt}.md`;
  const evalFile = join(absApp, 'eval', evalFileName);
  // Otherwise treat --eval as a bare name inside the app's eval/ directory
  if (!existsSync(evalFile)) {
    exitWithResolutionError(`Eval file not found: ${evalFile}`);
  }
  return [evalFile];
}
