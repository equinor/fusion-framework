import { execFile } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { promisify } from 'node:util';

import { describe, expect, it } from 'vitest';

const execFileAsync = promisify(execFile);

const packageManifest = JSON.parse(
  readFileSync(new URL('../package.json', import.meta.url), 'utf8'),
) as {
  name: string;
};

/**
 * Imports one of this package's built entry points through native Node ESM resolution.
 *
 * @param specifier - Built entry point relative to this test file.
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

/**
 * Imports the built `react-app/http` entry point under native Node ESM using direct file URLs for
 * the transitive `react-module-http` and `module-http` package references.
 *
 * @returns Native Node ESM stdout for the imported module.
 */
async function importReactAppHttpEntryPoint(): Promise<string> {
  const reactAppHttpEntry = new URL('../../../app/dist/esm/http/index.js', import.meta.url);
  const reactModuleHttpEntry = new URL('../dist/esm/index.js', import.meta.url);

  const script = `
    import { readFileSync } from 'node:fs';
    const entry = new URL(${JSON.stringify(reactAppHttpEntry.href)});
    const packageName = ${JSON.stringify(packageManifest.name)};
    const source = readFileSync(entry, 'utf8')
      .replaceAll(packageName, ${JSON.stringify(reactModuleHttpEntry.href)});
    await import('data:text/javascript,' + encodeURIComponent(source));
    process.stdout.write('ok');
  `;

  const { stdout } = await execFileAsync(process.execPath, [
    '--input-type=module',
    '--eval',
    script,
  ]);
  return stdout;
}

describe('react HTTP package ESM exports', () => {
  it('resolves the package root through native Node ESM', async () => {
    await expect(importBuiltEntryPoint('../dist/esm/index.js')).resolves.toBe('ok');
  });

  it('keeps react-app/http resolvable through the built HTTP dependency chain', async () => {
    await expect(importReactAppHttpEntryPoint()).resolves.toBe('ok');
  });
});
