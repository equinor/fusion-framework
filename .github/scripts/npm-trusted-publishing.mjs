#!/usr/bin/env node
/**
 * Manage npm trusted publishing (OIDC) for every public workspace package.
 *
 * npm binds each package to one GitHub workflow file (+ environment). Every
 * public package in this repository publishes through `.github/workflows/release.yml`
 * in the `npm` environment. See contributing/npm-publishing.md for the runbook.
 *
 * Commands:
 *   audit                 Report repository metadata, npm existence and trust state.
 *   bootstrap             Configure trust for every published package (idempotent).
 *   add <package...>      Bootstrap brand-new packages: publish a placeholder, then trust.
 *   verify [--tag <tag>]  Confirm the version behind a dist-tag was published by trusted publishing.
 *   preflight             CI gate: metadata + npm existence, no npm login required.
 */
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative, resolve } from 'node:path';
import { createInterface } from 'node:readline/promises';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';

export const TRUST_TARGET = Object.freeze({
  type: 'github',
  repository: 'equinor/fusion-framework',
  file: 'release.yml',
  environment: 'npm',
});

export const REGISTRY = 'https://registry.npmjs.org';
export const PLACEHOLDER_VERSION = '0.0.0-trusted-publishing.0';
export const PLACEHOLDER_TAG = 'trusted-publishing-bootstrap';
// npm expires a trust configuration that has not completed a publish within 2 days.
export const VALIDATION_WINDOW_MS = 2 * 24 * 60 * 60 * 1000;
// npm recommends ~2s between trust mutations to avoid registry rate limiting.
const MUTATION_DELAY_MS = 2000;
const REGISTRY_CONCURRENCY = 8;
const RELEASE_WORKFLOW_URL = `https://raw.githubusercontent.com/${TRUST_TARGET.repository}/main/.github/workflows/${TRUST_TARGET.file}`;

/**
 * Normalize a package.json `repository` field to `owner/repo` for GitHub, or null.
 *
 * @param {unknown} repository - `repository` value from package.json.
 * @returns {string | null} Lower-cased `owner/repo`, or null when not a GitHub repository.
 */
export function parseGitHubRepository(repository) {
  const url = typeof repository === 'string' ? repository : repository?.url;
  if (typeof url !== 'string' || url.length === 0) return null;
  const shorthand = /^(?:github:)?([\w.-]+)\/([\w.-]+?)(?:\.git)?$/.exec(url);
  if (shorthand && !url.includes('://')) return `${shorthand[1]}/${shorthand[2]}`.toLowerCase();
  const match = /github\.com[/:]([\w.-]+)\/([\w.-]+?)(?:\.git)?\/?(?:#.*)?$/.exec(url);
  return match ? `${match[1]}/${match[2]}`.toLowerCase() : null;
}

/**
 * Extract every top-level JSON value from npm output, which may print one JSON
 * document per trust configuration instead of a single array.
 *
 * @param {string} text - Raw stdout.
 * @returns {unknown[]} Parsed values; arrays are flattened.
 */
export function parseJsonValues(text) {
  const values = [];
  let depth = 0;
  let start = -1;
  let inString = false;
  let escaped = false;
  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (inString) {
      if (escaped) escaped = false;
      else if (char === '\\') escaped = true;
      else if (char === '"') inString = false;
      continue;
    }
    if (char === '"') inString = depth > 0;
    else if (char === '{' || char === '[') {
      if (depth === 0) start = index;
      depth++;
    } else if ((char === '}' || char === ']') && depth > 0) {
      depth--;
      if (depth === 0) {
        const value = JSON.parse(text.slice(start, index + 1));
        values.push(...(Array.isArray(value) ? value : [value]));
      }
    }
  }
  return values;
}

/**
 * Normalize a trust configuration from either the CLI's flattened shape or the
 * registry's raw `claims` shape.
 *
 * @param {Record<string, any>} entry - One trust configuration.
 * @returns {{ id?: string, type?: string, repository?: string, file?: string, environment?: string, permissions?: string[] }}
 */
export function normalizeTrustEntry(entry) {
  const claims = entry.claims ?? {};
  return {
    id: entry.id,
    type: entry.type,
    repository: entry.repository ?? claims.repository,
    file: entry.file ?? claims.workflow_ref?.file,
    environment: entry.environment ?? claims.environment ?? undefined,
    permissions: entry.permissions,
  };
}

/**
 * Whether a trust configuration lets `release.yml` in the `npm` environment publish.
 *
 * @param {ReturnType<typeof normalizeTrustEntry>} entry - Normalized trust configuration.
 * @param {typeof TRUST_TARGET} [target] - Expected identity.
 * @returns {boolean} True when the entry grants direct publish to the target identity.
 */
export function matchesTarget(entry, target = TRUST_TARGET) {
  if (entry.type !== target.type) return false;
  if (entry.repository?.toLowerCase() !== target.repository.toLowerCase()) return false;
  if (entry.file !== target.file) return false;
  if ((entry.environment ?? '') !== (target.environment ?? '')) return false;
  // Stage-only configs cannot publish directly; configs created before permissions existed can.
  if (Array.isArray(entry.permissions) && entry.permissions.length > 0) {
    return entry.permissions.some((permission) => !/stage/i.test(permission));
  }
  return true;
}

const isOtpError = (output) => /\bEOTP\b|one-time pass/i.test(output);
const isConflict = (output) => /\bE409\b|409 Conflict/i.test(output);
const isNotFound = (output) => /\bE404\b|404 Not Found/i.test(output);

/**
 * Create a runner for the npm CLI. Commands run outside the repository so the
 * pnpm-only project `.npmrc` does not produce npm warnings.
 *
 * @param {{ bin?: string, cwd?: string }} [options]
 */
export function createNpmRunner({ bin = 'npm', cwd = tmpdir() } = {}) {
  return {
    capture(args, options = {}) {
      const result = spawnSync(bin, args, { cwd: options.cwd ?? cwd, encoding: 'utf8' });
      const stdout = result.stdout ?? '';
      return {
        status: result.status ?? 1,
        stdout,
        output: `${stdout}${result.stderr ?? ''}${result.error ? String(result.error) : ''}`,
      };
    },
    interactive(args, options = {}) {
      const result = spawnSync(bin, args, { cwd: options.cwd ?? cwd, stdio: 'inherit' });
      return { status: result.status ?? 1 };
    },
  };
}

/**
 * Run an npm command, falling back to an interactive run when npm asks for 2FA.
 * npm can only prompt for 2FA on a TTY, so the retry inherits stdio; once the
 * maintainer ticks "skip 2FA for 5 minutes", later captured calls succeed.
 */
async function runNpm(context, args, { needsOutput = false, cwd } = {}) {
  const first = context.npm.capture(args, { cwd });
  if (first.status === 0 || !isOtpError(first.output)) return first;
  context.log(`  npm requires two-factor authentication for: npm ${args.join(' ')}`);
  context.log(`  Complete it below and enable "skip two-factor authentication for 5 minutes".`);
  const interactive = context.npm.interactive(args, { cwd });
  if (interactive.status !== 0) {
    return { status: interactive.status, stdout: '', output: 'interactive npm command failed' };
  }
  return needsOutput ? context.npm.capture(args, { cwd }) : { status: 0, stdout: '', output: '' };
}

/**
 * Read public workspace packages from pnpm.
 *
 * @param {string} cwd - Repository root.
 * @returns {{ name: string, path: string, repository: string | null, directory: string }[]}
 */
export function listWorkspacePackages(cwd = process.cwd()) {
  const result = spawnSync('pnpm', ['-r', 'ls', '--depth', '-1', '--json'], {
    cwd,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`pnpm -r ls failed: ${result.stderr || result.error}`);
  }
  return JSON.parse(result.stdout)
    .map(({ path }) => ({
      path,
      manifest: JSON.parse(readFileSync(join(path, 'package.json'), 'utf8')),
    }))
    .filter(({ manifest }) => manifest.name && manifest.private !== true)
    .map(({ path, manifest }) => ({
      name: manifest.name,
      path: relative(cwd, path),
      repository: parseGitHubRepository(manifest.repository),
      directory: manifest.repository?.directory ?? relative(cwd, path),
    }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

async function registryGet(context, path, accept = 'application/json') {
  const response = await context.fetch(`${context.registry}/${path}`, { headers: { accept } });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error(`GET ${path} returned ${response.status}`);
  return response.json();
}

const encodeName = (name) => name.replaceAll('/', '%2f');

/**
 * Fetch the dist-tags of a package, or null when it does not exist on npm.
 *
 * @returns {Promise<Record<string, string> | null>}
 */
async function getDistTags(context, name) {
  // The abbreviated packument returns 404 for unknown packages; the dist-tags endpoint returns 401.
  const packument = await registryGet(
    context,
    encodeName(name),
    'application/vnd.npm.install-v1+json',
  );
  const tags = packument?.['dist-tags'];
  return tags && Object.keys(tags).length > 0 ? tags : null;
}

async function mapConcurrent(items, limit, task) {
  const results = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await task(items[index]);
    }
  });
  await Promise.all(workers);
  return results;
}

function selectPackages(context, names) {
  if (!names?.length) return context.packages;
  const byName = new Map(context.packages.map((pkg) => [pkg.name, pkg]));
  const unknown = names.filter((name) => !byName.has(name));
  if (unknown.length > 0) {
    throw new Error(`Not a public workspace package: ${unknown.join(', ')}`);
  }
  return names.map((name) => byName.get(name));
}

const repositoryMatches = (pkg) => pkg.repository === TRUST_TARGET.repository.toLowerCase();

const repositoryHint = (pkg) =>
  `repository must point at ${TRUST_TARGET.repository}: set "repository": { "type": "git", "url": "git+https://github.com/${TRUST_TARGET.repository}.git", "directory": "${pkg.path}" } in ${pkg.path}/package.json`;

async function listTrust(context, name) {
  const result = await runNpm(context, ['trust', 'list', name, '--json'], { needsOutput: true });
  if (result.status !== 0) {
    // The registry may answer 404 for an existing package without trust configurations.
    if (isNotFound(result.output)) return { entries: [] };
    return { error: result.output.trim() || `npm trust list exited ${result.status}`, entries: [] };
  }
  return { entries: parseJsonValues(result.stdout).map(normalizeTrustEntry) };
}

async function ensureNpmTrustCli(context) {
  const help = context.npm.capture(['trust', 'github', '--help']);
  if (help.status !== 0 || !help.output.includes('--allow-publish')) {
    throw new Error(
      'npm CLI 11.15 or newer is required for `npm trust` (run `npm install -g npm@latest`).',
    );
  }
}

async function npmUser(context) {
  const whoami = context.npm.capture(['whoami']);
  return whoami.status === 0 ? whoami.stdout.trim() : null;
}

async function requireNpmLogin(context) {
  const user = await npmUser(context);
  if (!user) {
    throw new Error(
      'Not logged in to npm. Run `npm login` (the npm CLI, not `pnpm login`) with a maintainer account.',
    );
  }
  context.log(`npm user: ${user}`);
  return user;
}

/**
 * Configure the release.yml trust relationship for one existing package.
 *
 * @returns {Promise<{ status: 'already' | 'added' | 'would-add' | 'conflict' | 'error', detail?: string }>}
 */
async function trustPackage(context, pkg, { dryRun, replace }) {
  const current = await listTrust(context, pkg.name);
  if (current.error) return { status: 'error', detail: current.error };
  if (current.entries.some((entry) => matchesTarget(entry))) return { status: 'already' };

  // Only ever replace configurations owned by this repository.
  const stale = current.entries.filter(
    (entry) => entry.repository?.toLowerCase() === TRUST_TARGET.repository.toLowerCase(),
  );
  const describe = (entry) =>
    `${entry.type}:${entry.repository}/${entry.file}${entry.environment ? `@${entry.environment}` : ''}`;
  if (dryRun) {
    const others = current.entries.map(describe).join(', ');
    return { status: 'would-add', detail: others ? `existing: ${others}` : undefined };
  }

  const addTrust = () =>
    runNpm(context, [
      'trust',
      'github',
      pkg.name,
      '--repo',
      TRUST_TARGET.repository,
      '--file',
      TRUST_TARGET.file,
      '--env',
      TRUST_TARGET.environment,
      '--allow-publish',
      '--yes',
    ]);
  const revokeStale = async () => {
    for (const entry of stale) {
      await context.sleep(MUTATION_DELAY_MS);
      const revoked = await runNpm(context, ['trust', 'revoke', pkg.name, '--id', entry.id]);
      if (revoked.status !== 0) return `revoke ${describe(entry)}: ${revoked.output.trim()}`;
    }
    return null;
  };

  // Add first so a failure never leaves the package without its previous trust.
  await context.sleep(MUTATION_DELAY_MS);
  const added = await addTrust();
  if (added.status === 0) {
    const revokeError = replace ? await revokeStale() : null;
    return revokeError
      ? { status: 'added', detail: `stale config kept: ${revokeError}` }
      : { status: 'added' };
  }
  if (isNotFound(added.output)) {
    return {
      status: 'error',
      detail: 'npm returned 404; check that the logged-in npm user maintains this package',
    };
  }
  if (!isConflict(added.output)) return { status: 'error', detail: added.output.trim() };
  if (!replace || stale.length === 0) {
    return {
      status: 'conflict',
      detail: `registry rejected an additional configuration (existing: ${current.entries.map(describe).join(', ') || 'unknown'})${stale.length > 0 ? "; rerun with --replace to revoke this repository's stale configuration" : ''}`,
    };
  }

  // The registry only allows one configuration for this package: swap it.
  const revokeError = await revokeStale();
  if (revokeError) return { status: 'error', detail: revokeError };
  await context.sleep(MUTATION_DELAY_MS);
  const replaced = await addTrust();
  if (replaced.status === 0)
    return { status: 'added', detail: `replaced ${stale.map(describe).join(', ')}` };
  return {
    status: 'untrusted',
    fatal: true,
    detail: `revoked ${stale.map(describe).join(', ')} but adding ${TRUST_TARGET.file} failed: ${replaced.output.trim()}. Rerun: pnpm npm-trust bootstrap --package ${pkg.name}`,
  };
}

function printResults(context, results) {
  for (const { name, status, detail } of results) {
    context.log(`${`[${status}]`.padEnd(14)} ${name}${detail ? ` — ${detail}` : ''}`);
  }
  const counts = {};
  for (const { status } of results) counts[status] = (counts[status] ?? 0) + 1;
  context.log(
    `\n${Object.entries(counts)
      .map(([status, count]) => `${status}=${count}`)
      .join(' ')}`,
  );
}

async function warnIfWorkflowMissing(context) {
  try {
    const response = await context.fetch(RELEASE_WORKFLOW_URL, { method: 'HEAD' });
    if (response.ok) return;
  } catch {
    // Offline or blocked: the deadline reminder below still applies.
  }
  context.log(
    `\nWARNING: ${TRUST_TARGET.file} is not on main yet. New trust configurations expire unless`,
  );
  context.log('it is merged and publishes within 2 days.');
}

/** A dated snapshot tag, so `verify` cannot pass on an older run's versions. */
export function validationTag(now) {
  return `trusted-publishing-${new Date(now).toISOString().slice(0, 10).replaceAll('-', '')}`;
}

function printValidationReminder(context) {
  const deadline = new Date(context.now() + VALIDATION_WINDOW_MS).toISOString();
  const tag = validationTag(context.now());
  context.log(
    '\nIMPORTANT: npm expires trust configurations that have not published within 2 days.',
  );
  context.log(
    `Publish every newly trusted package through ${TRUST_TARGET.file} before ${deadline}:`,
  );
  context.log(
    `  gh workflow run ${TRUST_TARGET.file} --repo ${TRUST_TARGET.repository} --ref main -f tag=${tag}`,
  );
  context.log(`  pnpm npm-trust verify --tag ${tag}`);
}

/** Report metadata, npm existence and (when logged in) trust state for each package. */
export async function audit(context, { packages: names, offline = false } = {}) {
  const packages = selectPackages(context, names);
  const loggedIn = !offline && (await npmUser(context)) !== null;
  if (!offline && !loggedIn)
    context.log('Not logged in to npm: skipping trust checks (run `npm login`).\n');
  const existence = await mapConcurrent(packages, REGISTRY_CONCURRENCY, (pkg) =>
    getDistTags(context, pkg.name),
  );
  const results = [];
  for (const [index, pkg] of packages.entries()) {
    if (!repositoryMatches(pkg)) {
      results.push({ name: pkg.name, status: 'bad-repo', detail: repositoryHint(pkg) });
    } else if (!existence[index]) {
      results.push({
        name: pkg.name,
        status: 'unpublished',
        detail: `pnpm npm-trust add ${pkg.name}`,
      });
    } else if (!loggedIn) {
      results.push({ name: pkg.name, status: 'published' });
    } else {
      const trust = await listTrust(context, pkg.name);
      const status = trust.error
        ? 'error'
        : trust.entries.some((entry) => matchesTarget(entry))
          ? 'trusted'
          : 'untrusted';
      results.push({ name: pkg.name, status, detail: trust.error });
    }
  }
  printResults(context, results);
  return results.every(({ status }) => status === 'trusted' || status === 'published') ? 0 : 1;
}

/** Configure trust for every (or the selected) published package. */
export async function bootstrap(
  context,
  { packages: names, dryRun = false, replace = false } = {},
) {
  await ensureNpmTrustCli(context);
  await requireNpmLogin(context);
  const packages = selectPackages(context, names);
  context.log(
    `Target: ${TRUST_TARGET.repository} ${TRUST_TARGET.file} (environment: ${TRUST_TARGET.environment})${dryRun ? ' [dry run]' : ''}\n`,
  );
  const existence = await mapConcurrent(packages, REGISTRY_CONCURRENCY, (pkg) =>
    getDistTags(context, pkg.name),
  );
  const results = [];
  for (const [index, pkg] of packages.entries()) {
    if (!repositoryMatches(pkg)) {
      results.push({ name: pkg.name, status: 'bad-repo', detail: repositoryHint(pkg) });
      continue;
    }
    if (!existence[index]) {
      results.push({
        name: pkg.name,
        status: 'unpublished',
        detail: `use: pnpm npm-trust add ${pkg.name}`,
      });
      continue;
    }
    const outcome = await trustPackage(context, pkg, { dryRun, replace });
    context.log(`${`[${outcome.status}]`.padEnd(14)} ${pkg.name}`);
    results.push({ name: pkg.name, ...outcome });
    if (outcome.fatal) {
      context.log('Stopping: a package was left without trust. Fix it before continuing.');
      break;
    }
  }
  context.log('');
  printResults(context, results);
  if (results.some(({ status }) => status === 'added')) {
    await warnIfWorkflowMissing(context);
    printValidationReminder(context);
  }
  return results.every(({ status }) => ['already', 'added', 'would-add'].includes(status)) ? 0 : 1;
}

function writePlaceholder(directory, pkg) {
  const manifest = {
    name: pkg.name,
    version: PLACEHOLDER_VERSION,
    description: `Placeholder that reserves ${pkg.name} for npm trusted publishing. Do not install this version.`,
    license: 'MIT',
    repository: {
      type: 'git',
      url: `git+https://github.com/${TRUST_TARGET.repository}.git`,
      ...(pkg.directory ? { directory: pkg.directory } : {}),
    },
    publishConfig: { access: 'public' },
  };
  writeFileSync(join(directory, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  writeFileSync(
    join(directory, 'README.md'),
    `# ${pkg.name}\n\nThis placeholder exists so npm trusted publishing can be configured before the first real release from https://github.com/${TRUST_TARGET.repository}.\n`,
  );
}

async function waitForPackage(context, name) {
  for (let attempt = 0; attempt < 15; attempt++) {
    if (await getDistTags(context, name)) return true;
    await context.sleep(MUTATION_DELAY_MS);
  }
  return false;
}

/** Bootstrap brand-new packages: publish a placeholder, then configure trust. */
export async function add(
  context,
  { packages: names, dryRun = false, yes = false, replace = false } = {},
) {
  if (!names?.length) throw new Error('Usage: pnpm npm-trust add <package...>');
  await ensureNpmTrustCli(context);
  await requireNpmLogin(context);
  const packages = selectPackages(context, names);
  const results = [];
  for (const pkg of packages) {
    if (!repositoryMatches(pkg)) {
      results.push({ name: pkg.name, status: 'bad-repo', detail: repositoryHint(pkg) });
      continue;
    }
    if (!(await getDistTags(context, pkg.name))) {
      if (dryRun) {
        results.push({
          name: pkg.name,
          status: 'would-add',
          detail: `would publish ${PLACEHOLDER_VERSION} and add trust`,
        });
        continue;
      }
      const confirmed =
        yes ||
        (await context.confirm(`Publish placeholder ${pkg.name}@${PLACEHOLDER_VERSION} to npm?`));
      if (!confirmed) {
        results.push({ name: pkg.name, status: 'skipped' });
        continue;
      }
      const directory = context.makeTempDir();
      try {
        writePlaceholder(directory, pkg);
        const published = await runNpm(
          context,
          ['publish', '--access', 'public', '--tag', PLACEHOLDER_TAG],
          {
            cwd: directory,
          },
        );
        if (published.status !== 0) {
          results.push({
            name: pkg.name,
            status: 'error',
            detail: `placeholder publish failed: ${published.output.trim()}`,
          });
          continue;
        }
      } finally {
        context.removeTempDir(directory);
      }
      if (!(await waitForPackage(context, pkg.name))) {
        results.push({
          name: pkg.name,
          status: 'error',
          detail: 'placeholder is not visible on the registry yet; rerun add',
        });
        continue;
      }
      context.log(`placeholder published: ${pkg.name}@${PLACEHOLDER_VERSION}`);
    }
    const outcome = await trustPackage(context, pkg, { dryRun, replace });
    results.push({ name: pkg.name, ...outcome });
    if (outcome.fatal) break;
  }
  printResults(context, results);
  if (results.some(({ status }) => status === 'added')) {
    await warnIfWorkflowMissing(context);
    printValidationReminder(context);
  }
  return results.every(({ status }) => ['already', 'added', 'would-add'].includes(status)) ? 0 : 1;
}

/**
 * Read the GitHub workflow identity from a version's SLSA provenance statement.
 * npm verifies the attestation signature at publish time; this checks *which*
 * workflow produced it.
 *
 * @returns {Promise<{ repository?: string, path?: string, ref?: string } | null>}
 */
async function provenanceWorkflow(context, url) {
  const response = await context.fetch(url, { headers: { accept: 'application/json' } });
  if (!response.ok) return null;
  const { attestations = [] } = await response.json();
  const slsa = attestations.find(({ predicateType }) =>
    predicateType?.startsWith('https://slsa.dev/provenance/'),
  );
  const payload = slsa?.bundle?.dsseEnvelope?.payload;
  if (!payload) return null;
  const statement = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
  return statement.predicate?.buildDefinition?.externalParameters?.workflow ?? null;
}

/** Confirm the version behind a dist-tag was published by release.yml through trusted publishing. */
export async function verify(context, { packages: names, tag = 'latest' } = {}) {
  const packages = selectPackages(context, names);
  const results = await mapConcurrent(packages, REGISTRY_CONCURRENCY, async (pkg) => {
    const tags = await getDistTags(context, pkg.name);
    const version = tags?.[tag];
    if (!version) return { name: pkg.name, status: 'no-tag', detail: `no "${tag}" dist-tag` };
    const manifest = await registryGet(context, `${encodeName(pkg.name)}/${version}`);
    const publisher = manifest?._npmUser;
    const attestationsUrl = manifest?.dist?.attestations?.url;
    if (publisher?.trustedPublisher?.id !== 'github' || !attestationsUrl) {
      return {
        name: pkg.name,
        status: 'not-oidc',
        detail: `${version} published by ${publisher?.name ?? 'unknown'}${attestationsUrl ? '' : ' without provenance'}`,
      };
    }
    const workflow = await provenanceWorkflow(context, attestationsUrl);
    const expectedPath = `.github/workflows/${TRUST_TARGET.file}`;
    const expectedRepository = `https://github.com/${TRUST_TARGET.repository}`;
    if (
      workflow?.repository?.toLowerCase() !== expectedRepository ||
      workflow?.path !== expectedPath
    ) {
      return {
        name: pkg.name,
        status: 'wrong-source',
        detail: `${version} built by ${workflow?.repository ?? 'unknown'}/${workflow?.path ?? 'unknown'}`,
      };
    }
    return { name: pkg.name, status: 'verified', detail: `${version} (${workflow.ref})` };
  });
  printResults(context, results);
  return results.every(({ status }) => status === 'verified') ? 0 : 1;
}

/** CI gate that needs no npm login: repository metadata and npm existence. */
export async function preflight(context) {
  const existence = await mapConcurrent(context.packages, REGISTRY_CONCURRENCY, (pkg) =>
    getDistTags(context, pkg.name),
  );
  const problems = [];
  for (const [index, pkg] of context.packages.entries()) {
    if (!repositoryMatches(pkg)) problems.push(`${pkg.name}: ${repositoryHint(pkg)}`);
    else if (!existence[index]) {
      problems.push(
        `${pkg.name}: not on npm yet; a maintainer must run \`pnpm npm-trust add ${pkg.name}\``,
      );
    }
  }
  for (const problem of problems) context.log(`::error::${problem}`);
  if (problems.length === 0)
    context.log(`${context.packages.length} public packages ready for trusted publishing.`);
  return problems.length === 0 ? 0 : 1;
}

/**
 * Build the runtime context used by every command.
 *
 * @param {Partial<ReturnType<typeof createContext>>} [overrides] - Test doubles.
 */
export function createContext(overrides = {}) {
  return {
    npm: createNpmRunner(),
    fetch: globalThis.fetch,
    registry: REGISTRY,
    log: (message) => console.log(message),
    sleep: (ms) => new Promise((resolve) => setTimeout(resolve, ms)),
    now: () => Date.now(),
    makeTempDir: () => mkdtempSync(join(tmpdir(), 'npm-trust-placeholder-')),
    removeTempDir: (directory) => rmSync(directory, { recursive: true, force: true }),
    confirm: async (question) => {
      const prompt = createInterface({ input: process.stdin, output: process.stdout });
      try {
        return /^y(es)?$/i.test((await prompt.question(`${question} [y/N] `)).trim());
      } finally {
        prompt.close();
      }
    },
    get packages() {
      const packages = listWorkspacePackages();
      Object.defineProperty(this, 'packages', { value: packages });
      return packages;
    },
    ...overrides,
  };
}

const COMMANDS = { audit, bootstrap, add, verify, preflight };

async function main(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      'dry-run': { type: 'boolean', default: false },
      offline: { type: 'boolean', default: false },
      package: { type: 'string', multiple: true },
      replace: { type: 'boolean', default: false },
      tag: { type: 'string' },
      yes: { type: 'boolean', short: 'y', default: false },
      help: { type: 'boolean', short: 'h', default: false },
    },
  });
  const [command, ...rest] = positionals;
  if (values.help || !COMMANDS[command]) {
    console.log(
      readFileSync(new URL(import.meta.url), 'utf8')
        .match(/\/\*\*([\s\S]*?)\*\//)[1]
        .replace(/^ \* ?/gm, ''),
    );
    return values.help ? 0 : 1;
  }
  const packages = command === 'add' ? rest : (values.package ?? rest);
  return COMMANDS[command](createContext(), {
    packages,
    dryRun: values['dry-run'],
    offline: values.offline,
    replace: values.replace,
    tag: values.tag,
    yes: values.yes,
  });
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  main(process.argv.slice(2)).then(
    (code) => process.exit(code),
    (error) => {
      console.error(error.message);
      process.exit(1);
    },
  );
}
