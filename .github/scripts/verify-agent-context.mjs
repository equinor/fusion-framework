// Guards CODEMAP.md against drift. An inaccurate code map is worse than none —
// agents trust it, skip searching, and act on stale paths.
//
// Usage: node .github/scripts/verify-agent-context.mjs

import { globSync, readFileSync } from 'node:fs';
import { dirname, relative, resolve } from 'node:path';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');

const CODEMAP = 'CODEMAP.md';
const INSTRUCTIONS_DIR = '.github/instructions';

/** Collected problems, reported together so one run surfaces every drift at once. */
const problems = [];

/**
 * Records a drift problem against a specific file.
 *
 * @param file - Repository-relative path the problem belongs to.
 * @param message - Human-readable description of what is out of date.
 */
const report = (file, message) => {
  problems.push({ file, message });
};

const readRepoFile = (relativePath) => readFileSync(resolve(repoRoot, relativePath), 'utf8');

const codemap = readRepoFile(CODEMAP);
const rootPackageJson = JSON.parse(readRepoFile('package.json'));

// --- workspace inventory -----------------------------------------------------

const manifestPaths = globSync('{packages,cookbooks}/**/package.json', {
  cwd: repoRoot,
  exclude: (path) => path.includes('node_modules') || path.includes('/dist/'),
});

const workspacePackages = manifestPaths
  // Resolve each manifest to its declared name plus the directory agents will open
  .map((manifestPath) => {
    const manifest = JSON.parse(readRepoFile(manifestPath));
    return { name: manifest.name, dir: dirname(manifestPath) };
  })
  .filter((pkg) => typeof pkg.name === 'string');

const packageLibraries = workspacePackages.filter((pkg) => pkg.dir.startsWith('packages/'));
const cookbooks = workspacePackages.filter((pkg) => pkg.dir.startsWith('cookbooks/'));

// --- check: every workspace package is listed --------------------------------

for (const pkg of packageLibraries) {
  // Skip packages whose directory is already named in the map; the tables key on package name
  if (!codemap.includes(pkg.name)) {
    report(CODEMAP, `package \`${pkg.name}\` (${pkg.dir}) is missing from the package map`);
  }
}

for (const cookbook of cookbooks) {
  const folder = cookbook.dir.replace('cookbooks/', '');
  if (!codemap.includes(folder)) {
    report(CODEMAP, `cookbook \`${folder}\` is missing from the cookbooks list`);
  }
}

// --- check: nothing listed has been removed or renamed -----------------------

const knownNames = new Set(workspacePackages.map((pkg) => pkg.name));
// Negative lookahead skips documented name *patterns* like `@equinor/…-cookbook-<folder>`
const mentionedNames = new Set(
  codemap.match(/@equinor\/[a-z0-9-]+(?:\/[a-z0-9-]+)?(?![a-z0-9-]|<|\*)/g) ?? [],
);

for (const name of mentionedNames) {
  if (!knownNames.has(name)) {
    report(CODEMAP, `\`${name}\` is listed but no longer exists in the workspace`);
  }
}

// --- check: the declared package count is accurate ---------------------------

const declaredCount = codemap.match(/Framework libraries \((\d+) packages\)/);

if (!declaredCount) {
  report(CODEMAP, 'could not find the "Framework libraries (N packages)" count to verify');
} else if (Number(declaredCount[1]) !== packageLibraries.length) {
  report(
    CODEMAP,
    `declares ${declaredCount[1]} framework packages but the workspace has ${packageLibraries.length}`,
  );
}

// --- check: every "start here" path in the routing table exists --------------

const routingPaths = new Set(codemap.match(/`(packages|cookbooks)\/[^`]+`/g) ?? []);

for (const quoted of routingPaths) {
  const path = quoted.slice(1, -1);
  // Glob-style entries describe a family of directories rather than one real path
  if (path.includes('*')) {
    continue;
  }
  if (!existsSync(resolve(repoRoot, path))) {
    report(CODEMAP, `references \`${path}\`, which does not exist`);
  }
}

// --- check: every documented pnpm script exists ------------------------------

const scriptNames = new Set(Object.keys(rootPackageJson.scripts ?? {}));
const documentedScripts = new Set(codemap.match(/`pnpm ([a-z][a-z0-9:-]*)`/g) ?? []);

for (const quoted of documentedScripts) {
  const script = quoted.slice(1, -1).replace('pnpm ', '');
  // `pnpm install` and `pnpm exec ...` are pnpm builtins, not repository scripts
  if (script === 'install' || script === 'exec' || script === 'changeset') {
    continue;
  }
  if (!scriptNames.has(script)) {
    report(CODEMAP, `documents \`pnpm ${script}\`, which is not a script in package.json`);
  }
}

// --- check: instruction files declare usable frontmatter ---------------------

const instructionFiles = globSync(`${INSTRUCTIONS_DIR}/*.instructions.md`, { cwd: repoRoot });

for (const file of instructionFiles) {
  const frontmatter = readRepoFile(file).match(/^---\n([\s\S]*?)\n---/);

  if (!frontmatter) {
    report(file, 'is missing YAML frontmatter — Copilot will not attach it');
    continue;
  }

  // A missing description makes the file invisible in instruction pickers
  if (!/^description:\s*\S/m.test(frontmatter[1])) {
    report(file, 'frontmatter is missing a `description`');
  }
}

// --- report ------------------------------------------------------------------

if (problems.length === 0) {
  console.log('✓ agent context files are in sync with the workspace');
  process.exit(0);
}

console.error(`✗ ${problems.length} agent-context problem(s) found:\n`);

for (const problem of problems) {
  console.error(`  ${relative(repoRoot, resolve(repoRoot, problem.file))}: ${problem.message}`);
}

console.error('\nUpdate the file above, or the change that caused the drift.');
process.exit(1);
