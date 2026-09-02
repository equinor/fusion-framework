// Prevent package managers from publishing workspace TypeScript configuration and sources.
//
// Usage: node .github/scripts/verify-package-exports.mjs

import { globSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const publishExceptions = new Map([
  [
    '@equinor/fusion-framework-cli',
    [
      './bin',
      './dist/esm/lib',
      './dist/esm/version.js',
      './dist/types',
      './docs',
      './CHANGELOG.md',
      './README.md',
    ],
  ],
  ['@equinor/fusion-framework-lint-lsp', ['bin/fusion-lint-server.mjs', 'dist']],
  ['@equinor/fusion-lint', ['bin/fusion-lint.mjs', 'dist']],
  [
    '@equinor/fusion-services',
    ['dist', 'docs', 'src/apps/v1/openapi.json', 'src/roles/v1/openapi.json'],
  ],
]);

const problems = [];
const manifestPaths = globSync('packages/**/package.json', {
  cwd: repoRoot,
  exclude: (path) => path.includes('node_modules') || path.includes('/dist/'),
});

for (const manifestPath of manifestPaths) {
  const manifest = JSON.parse(readFileSync(resolve(repoRoot, manifestPath), 'utf8'));

  if (manifest.private) {
    continue;
  }

  const expectedFiles = publishExceptions.get(manifest.name) ?? ['dist'];

  if (JSON.stringify(manifest.files) !== JSON.stringify(expectedFiles)) {
    problems.push({
      file: manifestPath,
      message: `expected \`files\` to be ${JSON.stringify(expectedFiles)}, received ${JSON.stringify(manifest.files)}`,
    });
  }
}

if (problems.length === 0) {
  console.log('✓ published packages only include dist and explicit runtime artifacts');
  process.exit(0);
}

console.error(`✗ ${problems.length} package export problem(s) found:\n`);

for (const problem of problems) {
  console.error(`  ${relative(repoRoot, resolve(repoRoot, problem.file))}: ${problem.message}`);
}

console.error('\nRestrict the package files allowlist to prevent publishing workspace sources.');
process.exit(1);
