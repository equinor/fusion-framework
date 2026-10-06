import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

/**
 * Imports built package entry points through native Node ESM resolution.
 *
 * This catches publish-time regressions where `tsc` emits extensionless relative
 * specifiers that bundlers tolerate but Node rejects.
 *
 * @param specifier - Built package entry point relative to this test file.
 * @returns Native Node ESM stdout for the imported module.
 */
async function importBuiltEntryPoint(specifier: string): Promise<string> {
  const entryPoint = new URL(specifier, import.meta.url);
  const { stdout } = await execFileAsync(process.execPath, [
    '--input-type=module',
    '--eval',
    `import(${JSON.stringify(entryPoint.href)}).then(() => process.stdout.write('ok'))`,
  ]);

  return stdout;
}

describe('HTTP package ESM exports', () => {
  it('resolves the client subpath through native Node ESM', async () => {
    await expect(importBuiltEntryPoint('../dist/esm/lib/client/index.js')).resolves.toBe('ok');
  });

  it('resolves the package root through native Node ESM', async () => {
    await expect(importBuiltEntryPoint('../dist/esm/index.js')).resolves.toBe('ok');
  });
});
