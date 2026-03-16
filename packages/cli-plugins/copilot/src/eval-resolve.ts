import { existsSync, readdirSync } from 'node:fs';
import { extname, isAbsolute, join, resolve } from 'node:path';

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
      console.error(`❌ No eval directory found at ${evalDir}`);
      console.error('   Create eval/*.md files or use --eval <file>');
      process.exit(1);
    }
    const files = readdirSync(evalDir)
      .filter((f) => f.endsWith('.md'))
      .sort()
      .map((f) => join(evalDir, f));

    if (files.length === 0) {
      console.error(`❌ No .md files found in ${evalDir}`);
      process.exit(1);
    }
    return files;
  }

  if (evalOpt.includes('/') || evalOpt.includes('\\') || extname(evalOpt) === '.md') {
    const absPath = isAbsolute(evalOpt) ? evalOpt : resolve(evalOpt);
    if (!existsSync(absPath)) {
      console.error(`❌ Eval file not found: ${absPath}`);
      process.exit(1);
    }
    return [absPath];
  }

  const evalFile = join(absApp, 'eval', `${evalOpt}.md`);
  if (!existsSync(evalFile)) {
    console.error(`❌ Eval file not found: ${evalFile}`);
    process.exit(1);
  }
  return [evalFile];
}
