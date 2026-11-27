import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { test } from 'node:test';
import {
  checkExisting,
  isUpstreamToolingOnly,
  localUrl,
  upstreamPackages,
  verifyRanges,
  verifyReuse,
} from './dark-mode-preview.mjs';

const webCommit = 'a'.repeat(40);
const reactCommit = 'b'.repeat(40);
const integrity = `sha512-${'A'.repeat(86)}==`;
const webPackages = ['wc-chip', 'wc-markdown', 'wc-person', 'wc-theme'];
const reactPackages = [
  'react-context-selector',
  'react-errorboundary',
  'react-person',
  'react-side-sheet',
  'react-styles',
  'web-theme',
];
const entries = (names, suffix) =>
  Object.fromEntries(
    names.map((name) => [
      `@equinor/fusion-${name}`,
      { stableVersion: '3.0.0', version: `3.0.0${suffix}`, integrity },
    ]),
  );
const web = {
  repository: 'equinor/fusion-web-components',
  commit: webCommit,
  tag: 'dark-mode-aaaaaaaa',
  packages: entries(webPackages, '-dark-mode-aaaaaaaa'),
};
const react = {
  repository: 'equinor/fusion-react-components',
  commit: reactCommit,
  tag: 'dark-mode-bbbbbbbb-aaaaaaaa',
  upstream: {
    repository: web.repository,
    commit: web.commit,
    tag: web.tag,
    manifest: 'web-aaaaaaaa.json',
    lockIntegrity: integrity,
  },
  packages: entries(reactPackages, '-dark-mode.gbbbbbbbb.gaaaaaaaa'),
};

test('requires current Web and React manifests built as one chain', () => {
  assert.equal(upstreamPackages(web, react, webCommit, reactCommit).size, 10);
  assert.throws(() => upstreamPackages(web, react, webCommit, 'c'.repeat(40)));
  assert.throws(() =>
    upstreamPackages(
      web,
      {
        ...react,
        upstream: { ...react.upstream, commit: 'c'.repeat(40) },
      },
      webCommit,
      reactCommit,
    ),
  );
  assert.throws(
    () => upstreamPackages(web, { ...react, packages: {} }, webCommit, reactCommit),
    /Missing upstream preview/,
  );
});

test('validates stable release ranges independently of exact snapshot pins', () => {
  const repoRequire = createRequire(join(process.cwd(), 'package.json'));
  const { satisfies } = createRequire(repoRequire.resolve('@changesets/cli/package.json'))(
    'semver',
  );
  const packages = upstreamPackages(web, react, webCommit, reactCommit);
  const name = '@equinor/fusion-react-side-sheet';
  assert.doesNotThrow(() =>
    verifyRanges({ name: 'host', dependencies: { [name]: '^3.0.0' } }, packages, satisfies),
  );
  assert.throws(
    () => verifyRanges({ name: 'host', dependencies: { [name]: '^2.2.0' } }, packages, satisfies),
    /excludes planned 3.0.0/,
  );
});

test('rejects immutable byte conflicts and tag collisions even if the target version is absent', () => {
  const entry = { ...web.packages['@equinor/fusion-wc-chip'], tag: web.tag };
  const metadata = {
    'dist-tags': { [web.tag]: entry.version, 'dark-mode': '3.0.0', latest: '2.0.0' },
    versions: { [entry.version]: { dist: { integrity } } },
  };
  assert.equal(checkExisting(metadata, 'pkg', entry), true);
  assert.equal(checkExisting(null, 'pkg', entry), false);
  assert.throws(
    () => checkExisting(metadata, 'pkg', { ...entry, integrity: 'different' }),
    /Immutable version conflict/,
  );
  assert.throws(
    () => checkExisting(metadata, 'pkg', { ...entry, version: '4.0.0-elsewhere' }),
    /Refusing to move/,
  );
  assert.throws(() => localUrl('https://registry.npmjs.org/pkg.tgz'), /Refusing/);
});

test('reuse requires the complete framework package set and the original upstream manifests', () => {
  const commit = 'c'.repeat(40);
  const tag = 'dark-mode-cccccccc-bbbbbbbb-aaaaaaaa';
  const upstream = { 'web-aaaaaaaa.json': integrity, 'react-bbbbbbbb-aaaaaaaa.json': integrity };
  const name = '@equinor/fusion-framework-dev-portal';
  const release = {
    stableVersion: '11.1.13',
    version: '11.1.13-dark-mode.gcccccccc.gbbbbbbbb.gaaaaaaaa',
  };
  const expected = new Map([[name, release]]);
  const manifest = {
    repository: 'equinor/fusion-framework',
    commit,
    tag,
    upstream,
    packages: { [name]: { ...release, integrity } },
  };
  verifyReuse(manifest, commit, tag, upstream, expected);
  assert.throws(() => verifyReuse({ ...manifest, upstream: {} }, commit, tag, upstream, expected));
  assert.throws(() => verifyReuse({ ...manifest, packages: {} }, commit, tag, upstream, expected));
  const stable = { [name]: { ...release, version: release.stableVersion, integrity } };
  assert.throws(() =>
    verifyReuse({ ...manifest, packages: stable }, commit, tag, upstream, expected),
  );
});

const webHead = 'd'.repeat(40);
const webRepo = 'fusion-web-components';
const reactRepo = 'fusion-react-components';
const webComparison = {
  base: webCommit,
  mergeBase: webCommit,
  head: webHead,
  status: 'ahead',
  total: 1,
  commits: 1,
  files: [
    { path: 'CONTRIBUTING.md', status: 'modified', oldPath: null },
    { path: 'scripts/dark-mode-preview.mjs', status: 'modified', oldPath: null },
  ],
};

test('allows an unbroken Web descendant with only the documented tooling paths changed', () => {
  assert.equal(isUpstreamToolingOnly(webRepo, webComparison, webCommit, webHead), true);
  assert.equal(
    isUpstreamToolingOnly(
      webRepo,
      { ...webComparison, mergeBase: reactCommit },
      webCommit,
      webHead,
    ),
    false,
  );
  assert.equal(
    isUpstreamToolingOnly(webRepo, { ...webComparison, total: 251 }, webCommit, webHead),
    false,
  );
});

test('uses a repository-specific allowlist for the React comparison', () => {
  const files = [{ path: 'scripts/dark-mode-preview.js', status: 'modified', oldPath: null }];
  const comparison = { ...webComparison, files };
  assert.equal(isUpstreamToolingOnly(reactRepo, comparison, webCommit, webHead), true);
  assert.equal(isUpstreamToolingOnly(webRepo, comparison, webCommit, webHead), false);
});

test('blocks source, dependency, lockfile, and renamed-path changes even with tooling changes', () => {
  for (const path of [
    'packages/person/src/utils.ts',
    'packages/person/package.json',
    'package.json',
    'bun.lock',
  ]) {
    const files = [...webComparison.files, { path, status: 'modified', oldPath: null }];
    for (const repo of [webRepo, reactRepo]) {
      assert.equal(
        isUpstreamToolingOnly(repo, { ...webComparison, files }, webCommit, webHead),
        false,
        path,
      );
    }
  }
  const files = [
    { path: 'CONTRIBUTING.md', status: 'renamed', oldPath: 'packages/person/src/utils.ts' },
  ];
  assert.equal(
    isUpstreamToolingOnly(webRepo, { ...webComparison, files }, webCommit, webHead),
    false,
  );
});
