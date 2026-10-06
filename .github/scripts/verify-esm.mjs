// Guard the published ESM contract: every package is `"type": "module"` and every
// relative import carries an explicit file extension, so Node's ESM resolver (and tools
// that externalize to it, such as Vitest) can load the packages without a bundler.
//
// Usage:
//   node .github/scripts/verify-esm.mjs            static checks on package manifests and sources
//   node .github/scripts/verify-esm.mjs --runtime  import every built `exports` entry with native Node
//
// See https://github.com/equinor/fusion/issues/959 for the regression this prevents.

import { execFile } from 'node:child_process';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { availableParallelism } from 'node:os';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);
const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const runtime = process.argv.includes('--runtime');

/** Workspace package manifests, excluding installed dependencies and build output. */
const manifestPaths = globSync('packages/**/package.json', {
  cwd: repoRoot,
  exclude: (path) => path.includes('node_modules') || path.includes('/dist/'),
});

/**
 * Matches relative module specifiers in `from`, side-effect `import`, and dynamic `import()`
 * positions, capturing the quoted specifier.
 */
const relativeSpecifier =
  /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)(['"])(\.{1,2}(?:\/[^'"]*)?)\1/g;

/** Specifiers that already name a concrete file, or are asset/query imports handled by bundlers. */
const explicitSpecifier = /\.(?:js|mjs|cjs|json|css|scss|svg|png|md|mdx|html|wasm)$|\?/;

/** Node error codes and messages that mean the published ESM cannot be resolved or linked. */
const fatalRuntimeError =
  /ERR_MODULE_NOT_FOUND|ERR_UNSUPPORTED_DIR_IMPORT|ERR_UNKNOWN_FILE_EXTENSION|ERR_PACKAGE_PATH_NOT_EXPORTED|ERR_REQUIRE_ESM|MODULE_TYPELESS_PACKAGE_JSON|SyntaxError/;

/**
 * Export entries that fail only because a third-party dependency publishes invalid ESM.
 * Each entry names the upstream package so the exception can be removed once it is fixed.
 * Failures here are reported as warnings instead of errors.
 */
const upstreamFailures = new Map([
  [
    '@equinor/fusion-framework-react-components-people-provider',
    '@equinor/fusion-wc-person@3.5.6 uses directory imports in its published ESM (lib/index.js)',
  ],
]);

/**
 * Lists extensionless relative specifiers in a package's non-test sources.
 *
 * @param {string} packageDir - Absolute path to the package directory.
 * @returns {string[]} One `file:line specifier` entry per offending import.
 */
function findExtensionlessImports(packageDir) {
  const sources = globSync('src/**/*.{ts,tsx,mts}', {
    cwd: packageDir,
    exclude: (path) =>
      /(^|\/)(__tests__|__mocks__|tests?)(\/|$)|\.(test|spec|stories)\.tsx?$/.test(path),
  });
  const findings = [];
  // Comment lines are skipped so TSDoc `@example` blocks may show consumer-style imports.
  for (const source of sources) {
    const lines = readFileSync(resolve(packageDir, source), 'utf8').split('\n');
    lines.forEach((line, index) => {
      if (/^\s*(\*|\/\/|\/\*)/.test(line)) return;
      for (const [, , specifier] of line.matchAll(relativeSpecifier)) {
        if (!explicitSpecifier.test(specifier)) {
          findings.push(`${source}:${index + 1} '${specifier}'`);
        }
      }
    });
  }
  return findings;
}

/**
 * Collects the import specifiers a consumer can use for a package, one per `exports` entry
 * that resolves to JavaScript.
 *
 * @param {{ name: string, exports?: unknown }} manifest - Parsed package manifest.
 * @returns {string[]} Bare specifiers such as `@scope/pkg` and `@scope/pkg/sub`.
 */
function exportSpecifiers(manifest) {
  if (!manifest.exports || typeof manifest.exports !== 'object') return [manifest.name];
  return Object.entries(manifest.exports)
    .filter(([key, target]) => {
      const file = typeof target === 'string' ? target : (target?.import ?? target?.default);
      return !key.includes('*') && typeof file === 'string' && /\.m?js$/.test(file);
    })
    .map(([key]) => (key === '.' ? manifest.name : `${manifest.name}/${key.replace(/^\.\//, '')}`));
}

/**
 * Imports one specifier in a fresh Node process from inside the package, so resolution goes
 * through the package's own `exports` exactly as it does for a consumer.
 *
 * @param {string} packageDir - Directory to resolve from (enables package self-reference).
 * @param {string} specifier - Bare specifier to import.
 * @returns {Promise<{ specifier: string, error?: string, fatal: boolean }>} Import outcome.
 */
async function importInNode(packageDir, specifier) {
  try {
    const { stderr } = await execFileAsync(
      process.execPath,
      ['--input-type=module', '--eval', `await import(${JSON.stringify(specifier)});`],
      { cwd: packageDir, timeout: 60_000 },
    );
    // Node reports typeless-package reparsing as a warning, not an error; treat it as a failure.
    return { specifier, error: stderr.trim() || undefined, fatal: fatalRuntimeError.test(stderr) };
  } catch (error) {
    const output = `${error.stderr ?? ''}${error.message}`;
    const firstLine = output.split('\n').find((line) => /Error|ERR_/.test(line)) ?? output;
    return { specifier, error: firstLine.trim(), fatal: fatalRuntimeError.test(output) };
  }
}

/**
 * Runs async tasks with bounded concurrency.
 *
 * @template T
 * @param {Array<() => Promise<T>>} tasks - Task factories.
 * @param {number} limit - Maximum concurrent tasks.
 * @returns {Promise<T[]>} Results in task order.
 */
async function runPooled(tasks, limit) {
  const results = new Array(tasks.length);
  let next = 0;
  const worker = async () => {
    // Each worker drains the shared queue until no tasks remain.
    while (next < tasks.length) {
      const index = next++;
      results[index] = await tasks[index]();
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, tasks.length) }, worker));
  return results;
}

const problems = [];
const warnings = [];
const runtimeTasks = [];

// Every workspace package is checked statically; only published, built packages are imported.
for (const manifestPath of manifestPaths) {
  const packageDir = resolve(repoRoot, dirname(manifestPath));
  const manifest = JSON.parse(readFileSync(resolve(repoRoot, manifestPath), 'utf8'));

  if (!runtime) {
    if (manifest.type !== 'module') {
      problems.push(
        `${manifestPath}: expected "type": "module", received ${JSON.stringify(manifest.type)}`,
      );
    }
    for (const finding of findExtensionlessImports(packageDir)) {
      problems.push(
        `${relative(repoRoot, packageDir)}/${finding}: relative import needs an explicit extension`,
      );
    }
    continue;
  }

  if (manifest.private || !existsSync(resolve(packageDir, 'dist'))) continue;
  for (const specifier of exportSpecifiers(manifest)) {
    runtimeTasks.push(() => importInNode(packageDir, specifier));
  }
}

if (runtime) {
  const outcomes = await runPooled(runtimeTasks, availableParallelism());
  // Resolution failures break consumers; other errors (for example browser globals) are
  // expected for front-end packages imported under Node and are reported only.
  for (const { specifier, error, fatal } of outcomes) {
    if (!error) continue;
    const upstream = upstreamFailures.get(specifier);
    // Known upstream breakage stays visible as a warning so it is not forgotten.
    if (fatal && upstream) {
      warnings.push(`${specifier}: upstream ${upstream}`);
      continue;
    }
    (fatal ? problems : warnings).push(`${specifier}: ${error.split('\n')[0]}`);
  }
  console.log(`Imported ${outcomes.length} export entries with native Node ESM.`);
}

for (const warning of warnings) {
  console.warn(`warn  ${warning}`);
}

if (problems.length === 0) {
  console.log(
    runtime
      ? 'All export entries resolve under native Node ESM.'
      : 'ESM manifest and source checks passed.',
  );
} else {
  for (const problem of problems) {
    console.error(`error ${problem}`);
  }
  console.error(
    `\n${problems.length} ESM problem(s) found. See https://github.com/equinor/fusion/issues/959`,
  );
  process.exitCode = 1;
}
