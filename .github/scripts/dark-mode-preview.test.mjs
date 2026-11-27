import assert from 'node:assert/strict';
import { test } from 'node:test';
import { checkExisting, localUrl, upstreamPackages } from './dark-mode-preview.mjs';

test('only reuses the already-tagged immutable tarball', () => {
  const entry = { version: '38.0.0', integrity: 'sha512-original' };
  const metadata = {
    'dist-tags': { 'dark-mode': '38.0.0' },
    versions: { '38.0.0': { dist: { integrity: entry.integrity } } },
  };
  assert.equal(checkExisting(null, 'grid', entry), false);
  assert.equal(checkExisting(metadata, 'grid', entry), true);
  assert.throws(
    () => checkExisting(metadata, 'grid', { ...entry, integrity: 'sha512-other' }),
    /Immutable version conflict/,
  );
  assert.throws(
    () => checkExisting({ ...metadata, 'dist-tags': { latest: '38.0.0' } }, 'grid', entry),
    /Immutable version conflict/,
  );
});

test('never follows a metadata URL away from the authenticated loopback registry', () => {
  assert.equal(localUrl('http://127.0.0.1:4873/pkg.tgz').pathname, '/pkg.tgz');
  for (const url of [
    'https://registry.npmjs.org/pkg.tgz',
    'http://127.0.0.1:4874/pkg',
    'http://127.0.0.1:4873@example.org/pkg',
  ]) {
    assert.throws(() => localUrl(url), /Refusing/);
  }
});

test('a missing or ambiguous upstream preview does not fall back to a public version', () => {
  const manifest = { commit: 'a'.repeat(40), packages: {} };
  const web = { ...manifest, repository: 'equinor/fusion-web-components' };
  const react = { ...manifest, repository: 'equinor/fusion-react-components' };
  assert.throws(() => upstreamPackages(web, react), /Missing upstream preview/);
  const packages = {
    '@equinor/fusion-web-theme': { version: '0.2.0', integrity: `sha512-${'A'.repeat(86)}==` },
  };
  assert.throws(
    () => upstreamPackages({ ...web, packages }, { ...react, packages }),
    /Duplicate producer/,
  );
});
