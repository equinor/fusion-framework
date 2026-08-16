import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';

import {
  createNamespaceRouteMap,
  resolvePageRoute,
  rewriteNamespaceHref,
  type NamespaceRouteMaps,
} from './package-namespace-links-plugin';

const temporaryDirectories: string[] = [];

/**
 * Creates an isolated repository fixture for namespace route discovery tests.
 * @returns Absolute repository and VuePress source directories.
 */
const createRepositoryFixture = (): { repoRoot: string; sourceDir: string } => {
  const repoRoot = mkdtempSync(path.join(tmpdir(), 'fusion-doc-links-'));
  const sourceDir = path.join(repoRoot, 'vue-press', 'src');
  temporaryDirectories.push(repoRoot);
  mkdirSync(path.join(sourceDir, 'guide'), { recursive: true });
  mkdirSync(path.join(repoRoot, 'packages', 'example', 'docs'), { recursive: true });
  return { repoRoot, sourceDir };
};

/**
 * Writes UTF-8 fixture content and creates its parent directory.
 * @param filePath - Absolute fixture file path.
 * @param content - UTF-8 content to write.
 */
const writeFixture = (filePath: string, content: string): void => {
  mkdirSync(path.dirname(filePath), { recursive: true });
  writeFileSync(filePath, content, 'utf8');
};

afterEach(() => {
  // Remove every isolated repository created by the preceding test.
  for (const directory of temporaryDirectories.splice(0)) {
    rmSync(directory, { recursive: true, force: true });
  }
});

describe('resolvePageRoute', () => {
  it('maps README and Markdown files to VuePress routes', () => {
    expect(resolvePageRoute('README.md')).toBe('/');
    expect(resolvePageRoute('guide/README.md')).toBe('/guide/');
    expect(resolvePageRoute('guide/testing.md')).toBe('/guide/testing.html');
  });
});

describe('createNamespaceRouteMap', () => {
  it('discovers exact wrappers and explicit aggregate-directory links', () => {
    const { repoRoot, sourceDir } = createRepositoryFixture();
    writeFixture(
      path.join(repoRoot, 'packages/example/README.md'),
      '[Details](docs/details.md)\n[Docs](docs/)\n',
    );
    writeFixture(path.join(repoRoot, 'packages/example/docs/details.md'), '# Details\n');
    writeFixture(
      path.join(sourceDir, 'guide/example.md'),
      '<!-- @include: ../../../packages/example/README.md -->\n',
    );
    writeFixture(
      path.join(sourceDir, 'guide/details.md'),
      '<!-- @include: ../../../packages/example/docs/details.md -->\n',
    );

    const routeMaps = createNamespaceRouteMap(sourceDir, repoRoot);

    expect(routeMaps.exact['packages/example/README.md']).toBe('/guide/example.html');
    expect(routeMaps.exact['packages/example/docs/details.md']).toBe('/guide/details.html');
    expect(routeMaps.aliases['/guide/docs/details.html']).toBe('/guide/details.html');
    expect(routeMaps.aliases['/guide/docs/']).toBe('/guide/example.html');
  });

  it('does not map a missing child document to its package overview', () => {
    const { repoRoot, sourceDir } = createRepositoryFixture();
    writeFixture(
      path.join(repoRoot, 'packages/example/README.md'),
      '[Missing](docs/does-not-exist.md)\n',
    );
    writeFixture(
      path.join(sourceDir, 'guide/example.md'),
      '<!-- @include: ../../../packages/example/README.md -->\n',
    );

    const routeMaps = createNamespaceRouteMap(sourceDir, repoRoot);

    expect(routeMaps.aliases['/guide/docs/does-not-exist.html']).toBeUndefined();
  });

  it('scopes identical relative links to their owning wrapper routes', () => {
    const { repoRoot, sourceDir } = createRepositoryFixture();
    // Each package uses the same relative link text but owns a different target document.
    for (const name of ['msal', 'service-discovery']) {
      writeFixture(
        path.join(repoRoot, `packages/${name}/README.md`),
        '[Testing](./docs/testing.md)\n',
      );
      writeFixture(path.join(repoRoot, `packages/${name}/docs/testing.md`), `# ${name}\n`);
      writeFixture(
        path.join(sourceDir, `${name}/README.md`),
        `<!-- @include: ../../../packages/${name}/README.md -->\n`,
      );
      writeFixture(
        path.join(sourceDir, `${name}/testing.md`),
        `<!-- @include: ../../../packages/${name}/docs/testing.md -->\n`,
      );
    }

    const routeMaps = createNamespaceRouteMap(sourceDir, repoRoot);

    expect(routeMaps.aliases['/msal/docs/testing.html']).toBe('/msal/testing.html');
    expect(routeMaps.aliases['/service-discovery/docs/testing.html']).toBe(
      '/service-discovery/testing.html',
    );
    expect(routeMaps.aliases['./docs/testing.html']).toBeUndefined();
  });
});

describe('rewriteNamespaceHref', () => {
  const routeMaps: NamespaceRouteMaps = {
    exact: { 'packages/example/docs/testing.md': '/guide/testing.html' },
    aliases: {},
    sourceByRoute: { '/guide/testing.html': 'guide/testing.md' },
  };

  it('rewrites exact namespace links while preserving base paths and fragments', () => {
    expect(
      rewriteNamespaceHref(
        '/fusion-framework/packages/example/docs/testing.html#setup',
        routeMaps,
        '/fusion-framework/',
      ),
    ).toBe('/fusion-framework/guide/testing.html#setup');
  });

  it('leaves unresolved namespace and ordinary links unchanged', () => {
    expect(
      rewriteNamespaceHref(
        '/fusion-framework/packages/example/docs/missing.html',
        routeMaps,
        '/fusion-framework/',
      ),
    ).toBe('/fusion-framework/packages/example/docs/missing.html');
    expect(rewriteNamespaceHref('https://vitest.dev/', routeMaps, '/fusion-framework/')).toBe(
      'https://vitest.dev/',
    );
  });

  it('never rewrites external URLs containing repository namespace segments', () => {
    const externalUrl =
      'https://github.com/org/repo/blob/main/packages/example/docs/testing.md#setup';

    expect(rewriteNamespaceHref(externalUrl, routeMaps, '/fusion-framework/')).toBe(externalUrl);
    expect(
      rewriteNamespaceHref('//cdn.example.com/packages/example/docs/testing.md', routeMaps, '/'),
    ).toBe('//cdn.example.com/packages/example/docs/testing.md');
  });

  it('resolves relative aliases against the current wrapper route', () => {
    const scopedMaps: NamespaceRouteMaps = {
      exact: {},
      aliases: { '/modules/msal/docs/testing.html': '/modules/msal/testing.html' },
      sourceByRoute: {},
    };

    expect(
      rewriteNamespaceHref(
        './docs/testing.md',
        scopedMaps,
        '/fusion-framework/',
        '/modules/msal/',
      ),
    ).toBe('/modules/msal/testing.html');
  });
});