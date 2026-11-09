import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it, vi } from 'vitest';

import {
  collectThirdPartyPackages,
  formatThirdPartyNotices,
  readThirdPartyPackage,
  resolvePackageDirectory,
  THIRD_PARTY_NOTICES_FILE,
  thirdPartyNoticesPlugin,
  type ThirdPartyPackage,
} from './third-party-notices-plugin';

const temporaryDirectories: string[] = [];

/**
 * Creates an installed-package fixture inside a temporary `node_modules` tree.
 * @param name - Package name, scoped or unscoped.
 * @param manifest - Extra `package.json` fields.
 * @param files - Extra files written into the package directory.
 * @returns The package directory.
 */
const createPackage = (
  name: string,
  manifest: Record<string, unknown>,
  files: Record<string, string> = {},
): string => {
  const root = mkdtempSync(path.join(tmpdir(), 'fusion-doc-notices-'));
  temporaryDirectories.push(root);
  const directory = path.join(root, 'node_modules', name);
  mkdirSync(directory, { recursive: true });
  writeFileSync(path.join(directory, 'package.json'), JSON.stringify({ name, ...manifest }));
  for (const [file, content] of Object.entries(files)) {
    writeFileSync(path.join(directory, file), content);
  }
  return directory;
};

afterEach(() => {
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('resolvePackageDirectory', () => {
  it('resolves the innermost package of a pnpm module path', () => {
    expect(
      resolvePackageDirectory(
        '/repo/node_modules/.pnpm/elkjs@0.12.1/node_modules/elkjs/lib/elk.bundled.js',
      ),
    ).toBe('/repo/node_modules/.pnpm/elkjs@0.12.1/node_modules/elkjs');
  });

  it('keeps both segments of a scoped package and drops queries and virtual prefixes', () => {
    expect(
      resolvePackageDirectory('\0/repo/node_modules/@vue/shared/dist/shared.js?commonjs-proxy'),
    ).toBe('/repo/node_modules/@vue/shared');
  });

  it('ignores modules outside node_modules', () => {
    expect(resolvePackageDirectory('/repo/vue-press/src/.vuepress/client.ts')).toBeUndefined();
  });
});

describe('readThirdPartyPackage', () => {
  it('reads licence, source and licence files', () => {
    const directory = createPackage(
      'elkjs',
      {
        version: '0.12.1',
        license: 'EPL-2.0 OR GPL-3.0-or-later',
        repository: { type: 'git', url: 'git+https://github.com/kieler/elkjs.git' },
      },
      { 'LICENSE.md': 'Eclipse Public License - v 2.0\n', 'README.md': 'not a licence' },
    );

    expect(readThirdPartyPackage(directory)).toEqual({
      name: 'elkjs',
      version: '0.12.1',
      license: 'EPL-2.0 OR GPL-3.0-or-later',
      source: 'https://github.com/kieler/elkjs',
      licenseTexts: ['Eclipse Public License - v 2.0'],
    });
  });

  it('points to the licence text when package.json declares no licence', () => {
    const directory = createPackage('khroma', { version: '2.1.0' }, { license: 'The MIT License' });

    expect(readThirdPartyPackage(directory)).toMatchObject({
      license: 'not declared in package.json; see the license text below',
      licenseTexts: ['The MIT License'],
    });
  });

  it('expands repository shorthand and marks a missing licence', () => {
    const directory = createPackage('tiny', { version: '1.0.0', repository: 'github:owner/tiny' });

    expect(readThirdPartyPackage(directory)).toMatchObject({
      license: 'UNKNOWN',
      source: 'https://github.com/owner/tiny',
      licenseTexts: [],
    });
  });

  it('returns undefined when the directory has no package.json', () => {
    const root = mkdtempSync(path.join(tmpdir(), 'fusion-doc-notices-'));
    temporaryDirectories.push(root);

    expect(readThirdPartyPackage(root)).toBeUndefined();
  });
});

describe('collectThirdPartyPackages', () => {
  it('lists each package version once, sorted by name', () => {
    const read = vi.fn(
      (directory: string): ThirdPartyPackage => ({
        name: path.basename(directory),
        version: '1.0.0',
        license: 'MIT',
        licenseTexts: [],
      }),
    );

    const packages = collectThirdPartyPackages(
      [
        '/a/node_modules/mermaid/dist/mermaid.js',
        '/a/node_modules/mermaid/dist/chunk.js',
        '/b/node_modules/mermaid/dist/mermaid.js',
        '/a/node_modules/elkjs/lib/elk.js',
        '/a/vue-press/src/main.ts',
      ],
      read,
    );

    expect(packages.map((pkg) => pkg.name)).toEqual(['elkjs', 'mermaid']);
    expect(read).toHaveBeenCalledTimes(3);
  });
});

describe('formatThirdPartyNotices', () => {
  it('lists each package with its licence, source and licence text', () => {
    const notices = formatThirdPartyNotices([
      {
        name: 'elkjs',
        version: '0.12.1',
        license: 'EPL-2.0 OR GPL-3.0-or-later',
        source: 'https://github.com/kieler/elkjs',
        licenseTexts: ['Eclipse Public License - v 2.0'],
      },
      { name: 'tiny', version: '1.0.0', license: 'MIT', licenseTexts: [] },
    ]);

    expect(notices).toContain(
      'elkjs@0.12.1\nLicense: EPL-2.0 OR GPL-3.0-or-later\nSource: https://github.com/kieler/elkjs\n\nEclipse Public License - v 2.0',
    );
    // Packages without a repository fall back to their npm page.
    expect(notices).toContain('Source: https://www.npmjs.com/package/tiny/v/1.0.0');
  });
});

describe('thirdPartyNoticesPlugin', () => {
  const bundleWith = (moduleId: string) => ({
    'assets/app.js': { type: 'chunk' as const, moduleIds: [moduleId] },
    'assets/style.css': { type: 'asset' as const },
  });

  it('emits the notices file for the client build', () => {
    const directory = createPackage('mermaid', { version: '12.3.0', license: 'MIT' });
    const plugin = thirdPartyNoticesPlugin();
    const emitFile = vi.fn(() => 'ref');
    const environment = { config: { build: { ssr: false } } };

    plugin.generateBundle.call(
      { emitFile, environment },
      {},
      bundleWith(path.join(directory, 'dist/a.js')),
    );

    expect(emitFile).toHaveBeenCalledWith({
      type: 'asset',
      fileName: THIRD_PARTY_NOTICES_FILE,
      source: expect.stringContaining('mermaid@12.3.0\nLicense: MIT'),
    });
  });

  it('skips the server-side rendering build', () => {
    const plugin = thirdPartyNoticesPlugin();
    const emitFile = vi.fn(() => 'ref');
    const environment = { config: { build: { ssr: true } } };

    plugin.generateBundle.call({ emitFile, environment }, {}, bundleWith('/a/node_modules/vue/index.js'));

    expect(emitFile).not.toHaveBeenCalled();
  });
});
