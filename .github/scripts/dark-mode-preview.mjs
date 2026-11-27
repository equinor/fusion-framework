// Opt-in local producer for the coordinated Verdaccio dark-mode snapshots.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  globSync,
  linkSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { createRequire } from 'node:module';
import { homedir, tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const registry = 'http://127.0.0.1:4873';
const config = join(homedir(), '.config/fusion-dark-mode');
const npmrc = join(config, 'npmrc');
const repository = 'equinor/fusion-framework';
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const integrity = (bytes) => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;
const sha = /^[a-f0-9]{40}$/;
const sri = /^sha512-[\w+/]{86}==$/;
const stableSemver = /^\d+\.\d+\.\d+$/;
const runtimeFields = ['dependencies', 'optionalDependencies', 'peerDependencies'];
const theme = '@equinor/fusion-web-theme';
const previewPaths = new Set([
  '.github/scripts/dark-mode-preview.mjs',
  '.github/scripts/dark-mode-preview.test.mjs',
  'contributing/dark-mode-preview.md',
]);
const rangeChanges = [
  ['packages/dev-portal', 'devDependencies', 'fusion-react-errorboundary', '^2.0.15'],
  ['packages/dev-portal', 'devDependencies', 'fusion-react-side-sheet', '^2.2.0'],
  ['packages/react/components/roles', 'devDependencies', 'fusion-react-errorboundary', '^2.0.11'],
  ['packages/react/components/roles', 'peerDependencies', 'fusion-react-errorboundary', '^2.0.0'],
  ['cookbooks/app-react-router', 'devDependencies', 'fusion-react-side-sheet', '^2.0.0'],
  ['cookbooks/portal-analytics', 'dependencies', 'fusion-react-side-sheet', '^2.0.0'],
];

// Only the public packages covered by the PR's dark-mode changesets. Consumers
// override the released CLI's dev-portal and the dev-server's SPA plugin at install time.
const releases = [
  ['packages/modules/ag-grid', 'major'],
  ['packages/react/ag-grid', 'major'],
  ['packages/react/components/bookmark', 'major'],
  ['packages/react/components/roles', 'minor'],
  ['packages/vite-plugins/spa', 'patch'],
  ['packages/dev-portal', 'patch'],
];
const required = [
  'fusion-react-context-selector',
  'fusion-react-errorboundary',
  'fusion-react-person',
  'fusion-react-side-sheet',
  'fusion-react-styles',
  'fusion-wc-chip',
  'fusion-wc-markdown',
  'fusion-wc-person',
  'fusion-wc-theme',
  'fusion-web-theme',
].map((name) => `@equinor/${name}`);

/** Reject incomplete producer handoffs before resolving anything from a registry. */
export function upstreamPackages(web, react, webCommit, reactCommit) {
  for (const hash of [webCommit, reactCommit]) assert.match(hash, sha);
  const webShort = webCommit.slice(0, 8);
  const reactShort = reactCommit.slice(0, 8);
  assert.equal(web.commit, webCommit);
  assert.equal(react.commit, reactCommit);
  assert.equal(web.tag, `dark-mode-${webShort}`);
  assert.equal(react.tag, `dark-mode-${reactShort}-${webShort}`);
  assert.equal(react.upstream.repository, web.repository);
  assert.equal(react.upstream.commit, web.commit);
  assert.equal(react.upstream.tag, web.tag);
  assert.equal(react.upstream.manifest, `web-${webShort}.json`);
  assert.match(react.upstream.lockIntegrity, sri);
  const packages = new Map();
  for (const [producer, manifest, suffix] of [
    ['web', web, `-dark-mode-${webShort}`],
    ['react', react, `-dark-mode.g${reactShort}.g${webShort}`],
  ]) {
    assert.equal(manifest.repository, `equinor/fusion-${producer}-components`);
    for (const [name, entry] of Object.entries(manifest.packages)) {
      assert.match(name, /^@equinor\/fusion-[a-z0-9-]+$/);
      assert.match(entry.stableVersion, stableSemver);
      assert.equal(entry.version, `${entry.stableVersion}${suffix}`);
      assert.match(entry.integrity, sri);
      assert.ok(!packages.has(name), `Duplicate producer for ${name}`);
      packages.set(name, { ...entry, tag: manifest.tag });
    }
  }
  for (const name of required) assert.ok(packages.has(name), `Missing upstream preview: ${name}`);
  return packages;
}

/** Never send the dedicated Verdaccio credential to a registry-provided external URL. */
export function localUrl(url) {
  const parsed = new URL(url);
  assert.ok(
    parsed.origin === registry && !parsed.username && !parsed.password,
    'Refusing a non-local registry URL or embedded credentials',
  );
  return parsed;
}

/** Reuse only the same immutable bytes already published under the preview tag. */
export function checkExisting(metadata, name, { version, integrity: expected, tag }) {
  const existing = metadata?.versions?.[version];
  const tagged = metadata?.['dist-tags']?.[tag];
  assert.ok(!tagged || tagged === version, `Refusing to move ${name}'s ${tag} tag from ${tagged}`);
  if (!existing) return false;
  assert.ok(
    tagged === version && existing.dist.integrity === expected,
    `Immutable version conflict: ${name}@${version}. Do not overwrite or retag it.`,
  );
  return true;
}

function verifyHeads(commit, webCommit, reactCommit) {
  for (const [repo, number, expected] of [
    ['fusion-framework', '6035', commit],
    ['fusion-web-components', '2551', webCommit],
    ['fusion-react-components', '3514', reactCommit],
  ]) {
    const actual = execFileSync(
      'gh',
      [
        'pr',
        'view',
        number,
        '-R',
        `equinor/${repo}`,
        '--json',
        'headRefOid',
        '--jq',
        '.headRefOid',
      ],
      { encoding: 'utf8' },
    ).trim();
    if (repo === 'fusion-framework') {
      verifySource(commit, actual);
      verifySource(commit, 'HEAD');
    } else {
      assert.equal(actual, expected, `Unexpected live ${repo} head; coordinate new snapshots`);
    }
  }
}

function verifySource(commit, head) {
  execFileSync('git', ['merge-base', '--is-ancestor', commit, head]);
  const paths = execFileSync(
    'git',
    ['diff', '--no-renames', '--name-only', '-z', commit, head, '--'],
    {
      encoding: 'utf8',
    },
  );
  assert.ok(
    paths
      .split('\0')
      .filter(Boolean)
      .every((path) => previewPaths.has(path)),
    `${head} differs from ${commit} outside the preview tooling; coordinate a new snapshot`,
  );
}

/** Compare release ranges before local prerelease tarballs override dependency resolution. */
export function verifyRanges(manifest, entries, satisfies) {
  for (const field of [...runtimeFields, 'devDependencies']) {
    for (const [name, spec] of Object.entries(manifest[field] ?? {})) {
      const entry = entries.get(name);
      if (entry) {
        assert.ok(
          satisfies(entry.stableVersion, spec),
          `${manifest.name} ${field} ${name}@${spec} excludes planned ${entry.stableVersion}`,
        );
      }
    }
  }
}

/** Validate a reused manifest before relying on its immutable registry entries. */
export function verifyReuse(manifest, commit, tag, upstream, expected) {
  assert.equal(manifest.repository, repository);
  assert.equal(manifest.commit, commit);
  assert.equal(manifest.tag, tag);
  assert.deepEqual(manifest.upstream, upstream);
  assert.deepEqual(Object.keys(manifest.packages).sort(), [...expected.keys()].sort());
  for (const [name, entry] of Object.entries(manifest.packages)) {
    assert.equal(entry.stableVersion, expected.get(name).stableVersion);
    assert.equal(entry.version, expected.get(name).version);
    assert.match(entry.integrity, sri);
  }
}

function readPrivate(file) {
  assert.equal(statSync(file).mode & 0o077, 0, `${basename(file)} must be private`);
  return readFileSync(file);
}

async function preview(commit, webCommit, reactCommit, publish) {
  for (const hash of [commit, webCommit, reactCommit]) assert.match(hash, sha);
  const webShort = webCommit.slice(0, 8);
  const reactShort = reactCommit.slice(0, 8);
  const manifestNames = [`web-${webShort}.json`, `react-${reactShort}-${webShort}.json`];
  const upstreamFiles = manifestNames.map((file) => readPrivate(join(config, file)));
  const packages = upstreamPackages(
    ...upstreamFiles.map((bytes) => JSON.parse(bytes.toString())),
    webCommit,
    reactCommit,
  );
  const repoRequire = createRequire(join(process.cwd(), 'package.json'));
  const { inc, satisfies } = createRequire(repoRequire.resolve('@changesets/cli/package.json'))(
    'semver',
  );
  const settings = new Map(
    readPrivate(npmrc)
      .toString()
      .trim()
      .split(/\r?\n/)
      .map((line) => {
        const equals = line.indexOf('=');
        return [line.slice(0, equals).trim(), line.slice(equals + 1).trim()];
      }),
  );
  for (const key of ['registry', '@equinor:registry']) localUrl(settings.get(key));
  const token = settings.get('//127.0.0.1:4873/:_authToken');
  assert.ok(token, 'No loopback registry credential in the private preview npmrc');
  const get = (url) =>
    fetch(localUrl(url), {
      redirect: 'error',
      // Synchronous builds between requests can outlive Verdaccio's idle sockets.
      headers: { authorization: `Bearer ${token}`, connection: 'close' },
      signal: AbortSignal.timeout(90_000),
    });
  const metadata = async (name) => {
    const response = await get(`${registry}/${encodeURIComponent(name)}`);
    if (response.status === 404) return null;
    assert.ok(response.ok, `Cannot read ${name}: HTTP ${response.status}`);
    return response.json();
  };
  const download = async (name, entry, info) => {
    assert.ok(checkExisting(info, name, entry), `Missing local preview: ${name}@${entry.version}`);
    const response = await get(info.versions[entry.version].dist.tarball);
    assert.ok(response.ok, `Cannot download ${name}: HTTP ${response.status}`);
    const bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(integrity(bytes), entry.integrity, `Tarball integrity mismatch: ${name}`);
    return bytes;
  };
  verifyHeads(commit, webCommit, reactCommit);
  const frameworkShort = commit.slice(0, 8);
  const tag = `dark-mode-${frameworkShort}-${reactShort}-${webShort}`;
  const suffix = `-dark-mode.g${frameworkShort}.g${reactShort}.g${webShort}`;
  const output = join(config, `framework-${frameworkShort}-${reactShort}-${webShort}.json`);
  const upstream = Object.fromEntries(
    manifestNames.map((file, i) => [file, integrity(upstreamFiles[i])]),
  );
  const expected = new Map(
    releases.map(([dir, bump]) => {
      const { name, version } = JSON.parse(
        execFileSync('git', ['show', `${commit}:${dir}/package.json`], { encoding: 'utf8' }),
      );
      const stableVersion = inc(version, bump);
      assert.ok(stableVersion, `Invalid release version for ${name}`);
      return [name, { stableVersion, version: `${stableVersion}${suffix}` }];
    }),
  );
  let existingManifest;
  try {
    existingManifest = JSON.parse(readPrivate(output));
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  if (existingManifest) {
    verifyReuse(existingManifest, commit, tag, upstream, expected);
    for (const name of required) {
      await download(name, packages.get(name), await metadata(name));
    }
    for (const [name, entry] of Object.entries(existingManifest.packages)) {
      await download(name, { ...entry, tag }, await metadata(name));
    }
    verifyHeads(commit, webCommit, reactCommit);
    console.log(`Reused ${expected.size} verified local packages; no writes; manifest: ${output}`);
    return;
  }
  const scratch = mkdtempSync(join(tmpdir(), 'fusion-framework-dark-mode-'));
  try {
    const stage = join(scratch, 'source');
    const out = join(scratch, 'tarballs');
    mkdirSync(stage);
    mkdirSync(out);
    const archive = join(scratch, 'source.tar');
    execFileSync('git', ['archive', '--output', archive, commit]);
    execFileSync('tar', ['-xf', archive, '-C', stage]);
    const stagedRanges = rangeChanges.map(([dir, field, suffix, previous]) => {
      const name = `@equinor/${suffix}`;
      const file = join(stage, dir, 'package.json');
      const pkg = readJson(file);
      assert.equal(
        pkg[field]?.[name],
        previous,
        `Expected starting range for ${pkg.name}: ${name}`,
      );
      assert.equal(packages.get(name)?.stableVersion, '3.0.0', `Reassess range for ${name}`);
      pkg[field][name] = '^3.0.0';
      writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
      console.log(`${pkg.name} ${field}: ${name} ${previous} -> ^3.0.0 (scratch only)`);
      return { package: pkg.name, field, name, previous, range: '^3.0.0' };
    });
    const inputs = join(stage, '.preview-inputs');
    mkdirSync(inputs);
    const selected = new Set(required);
    const manifests = globSync('**/package.json', {
      cwd: stage,
      exclude: ['**/node_modules/**', '**/fixtures/**'],
    }).map((file) => readJson(join(stage, file)));
    for (const manifest of manifests) {
      verifyRanges(manifest, packages, satisfies);
      for (const field of [...runtimeFields, 'devDependencies']) {
        for (const name of Object.keys(manifest[field] ?? {})) {
          if (packages.has(name)) selected.add(name);
        }
      }
    }
    const themeParents = new Set(
      manifests
        .filter((pkg) => [...runtimeFields, 'devDependencies'].some((field) => pkg[field]?.[theme]))
        .map(({ name }) => name),
    );
    const files = new Map();
    const preservedEdges = [];
    for (const name of selected) {
      const entry = packages.get(name);
      const file = `${basename(name)}-${entry.version}.tgz`;
      const path = join(inputs, file);
      writeFileSync(path, await download(name, entry, await metadata(name)));
      const packed = packedManifest(path);
      assert.equal(packed.name, name);
      assert.equal(packed.version, entry.version);
      for (const field of runtimeFields) {
        for (const [dependency, spec] of Object.entries(packed[field] ?? {})) {
          const dependencyEntry = packages.get(dependency);
          if (!dependencyEntry) continue;
          if (entry.tag === `dark-mode-${webShort}` && dependency === theme && spec === '^0.1.12') {
            preservedEdges.push({ name, dependency, spec });
            console.log(`${name} retains published ${dependency}@${spec}`);
            continue;
          }
          assert.ok(
            dependencyEntry.version === spec || satisfies(dependencyEntry.stableVersion, spec),
            `${name} ${field} requires ${dependency}@${spec}; handoff is ${dependencyEntry.version}`,
          );
          if (dependency === theme) themeParents.add(name);
          selected.add(dependency);
        }
      }
      files.set(name, path);
    }
    // The Web artifacts' theme range predates React's differently versioned snapshot.
    const pins = [...files].flatMap(([name, path]) =>
      name === theme
        ? [...themeParents].map((parent) => [`${parent}>${name}`, basename(path)])
        : [[name, basename(path)]],
    );
    assert.ok(themeParents.size, `No verified edge to ${theme}`);
    const overrideLines = (prefix) =>
      pins.map(([selector, file]) => `  "${selector}": "file:${prefix}/${file}"`);
    const overrides = overrideLines('.preview-inputs');
    // Keep the repository's existing overrides and supply-chain policy. Only the
    // disposable checkout resolves preview names to the authenticated, verified bytes.
    const workspace = join(stage, 'pnpm-workspace.yaml');
    const yaml = readFileSync(workspace, 'utf8');
    assert.equal(yaml.match(/^overrides:$/gm)?.length, 1);
    writeFileSync(
      workspace,
      `${yaml.replace(/^overrides:$/m, ['overrides:', ...overrides].join('\n'))}
registry: "${registry}/"
registries:
  "${registry}/":
    scopes: ["@equinor"]
`,
    );
    const pnpm = (cwd, ...args) =>
      execFileSync('pnpm', args, {
        cwd,
        stdio: 'inherit',
        env: {
          ...process.env,
          PNPM_CONFIG_NPMRC_AUTH_FILE: npmrc,
          NPM_CONFIG_USERCONFIG: npmrc,
          NPM_CONFIG_REGISTRY: registry,
        },
      });
    const releasePlan = join(scratch, 'release-plan.json');
    execFileSync(
      join(process.cwd(), 'node_modules/.bin/changeset'),
      ['status', `--output=${releasePlan}`],
      { stdio: 'inherit' },
    );
    const releaseVersions = new Map(
      readJson(releasePlan).releases.map((release) => [release.name, release]),
    );
    const planned = [];
    for (const [dir, bump] of releases) {
      const cwd = join(stage, dir);
      const file = join(cwd, 'package.json');
      const pkg = readJson(file);
      assert.ok(
        !pkg.private && pkg.publishConfig?.access === 'public' && !pkg.publishConfig.registry,
      );
      const release = releaseVersions.get(pkg.name);
      assert.equal(release?.type, bump, `Unexpected Changesets bump: ${pkg.name}`);
      const stableVersion = release.newVersion;
      assert.match(stableVersion, stableSemver);
      const version = `${stableVersion}${suffix}`;
      assert.deepEqual({ stableVersion, version }, expected.get(pkg.name));
      pnpm(cwd, 'version', version, '--no-git-tag-version');
      assert.equal(readJson(file).version, version);
      planned.push({ cwd, name: pkg.name, version, stableVersion });
    }
    pnpm(stage, 'install', '--no-frozen-lockfile');
    const installedCopies = (name) =>
      new Set(
        globSync(`node_modules/.pnpm/*/node_modules/${name}/package.json`, {
          cwd: stage,
        }).map((copy) => realpathSync(join(stage, copy))),
      );
    // Verify what pnpm actually installed, not just what the metadata/override requested.
    // A package can have multiple virtual-store copies for different peer contexts.
    for (const name of required) {
      const entry = packages.get(name);
      const tarball = join(inputs, `${basename(name)}-${entry.version}.tgz`);
      const js = execFileSync('tar', ['-tf', tarball], { encoding: 'utf8' })
        .split('\n')
        .find((file) => /^package\/.*\.[cm]?js$/.test(file));
      assert.ok(js, `No built JavaScript in ${name}`);
      const expected = execFileSync('tar', ['-xOf', tarball, js], { maxBuffer: 64 * 1024 ** 2 });
      let verified = 0;
      for (const copy of installedCopies(name)) {
        assert.ok(copy.startsWith(`${realpathSync(stage)}/node_modules/.pnpm/`));
        const installedVersion = readJson(copy).version;
        if (name === theme && installedVersion !== entry.version) continue;
        assert.equal(installedVersion, entry.version, `Wrong installed ${name}`);
        assert.equal(
          integrity(readFileSync(join(copy, '..', js.slice('package/'.length)))),
          integrity(expected),
          `Installed JavaScript differs from the preview tarball: ${name}`,
        );
        verified += 1;
      }
      assert.ok(verified > 0, `${name}@${entry.version} was not installed`);
    }
    for (const { name, dependency, spec } of preservedEdges) {
      const copies = installedCopies(name);
      assert.ok(copies.size > 0, `Cannot verify preserved dependency of ${name}`);
      for (const copy of copies) {
        const installed = readJson(join(copy, '../../..', dependency, 'package.json'));
        assert.ok(satisfies(installed.version, spec), `${name} resolved wrong ${dependency}`);
        console.log(`${name} resolves ${dependency}@${installed.version} for ${spec}`);
      }
    }
    for (const name of themeParents) {
      for (const copy of installedCopies(name)) {
        if (readJson(copy).version !== packages.get(name)?.version) continue;
        const installed = readJson(join(copy, '../../..', theme, 'package.json'));
        assert.equal(
          installed.version,
          packages.get(theme).version,
          `${name} resolved wrong ${theme}`,
        );
      }
    }
    pnpm(
      stage,
      'exec',
      'turbo',
      'run',
      'build',
      '--concurrency=2',
      '--cache=local:rw',
      ...planned.map(({ name }) => `--filter=${name}...`),
    );
    pnpm(
      join(stage, 'packages/dev-portal'),
      'exec',
      'vitest',
      'run',
      '--config',
      'vitest.config.ts',
      'src/install-eds-color-scheme.test.ts',
    );
    const result = {};
    for (const { cwd, name, version, stableVersion } of planned) {
      const file = join(out, `${basename(name)}.tgz`);
      const sourceManifest = join(cwd, 'package.json');
      const pkg = readJson(sourceManifest);
      for (const field of runtimeFields) {
        for (const dependency of Object.keys(pkg[field] ?? {})) {
          if (files.has(dependency)) pkg[field][dependency] = packages.get(dependency).version;
          const sibling = planned.find(({ name }) => name === dependency);
          if (sibling) pkg[field][dependency] = `workspace:${sibling.version}`;
        }
      }
      writeFileSync(sourceManifest, `${JSON.stringify(pkg, null, 2)}\n`);
      pnpm(cwd, 'pack', '--out', file);
      const packed = packedManifest(file);
      assert.equal(packed.name, name);
      assert.equal(packed.version, version);
      assert.ok(!packed.private && !packed.publishConfig?.registry);
      for (const field of runtimeFields) {
        for (const [dependency, spec] of Object.entries(packed[field] ?? {})) {
          assert.doesNotMatch(spec, /workspace:|catalog:|file:|link:|127\.0\.0\.1/);
          if (files.has(dependency)) assert.equal(spec, packages.get(dependency).version);
        }
      }
      if (name.endsWith('-react-ag-grid')) {
        assert.equal(packed.dependencies['@equinor/fusion-framework-module-ag-grid'], version);
      }
      result[name] = { version, stableVersion, integrity: integrity(readFileSync(file)) };
    }
    // The released CLI pins a dev portal, and its dev server pins a SPA plugin.
    // Prove the consumer's transitive overrides reach both runtime package edges.
    const consumer = join(scratch, 'consumer');
    mkdirSync(consumer);
    const cli = readJson(join(stage, 'packages/cli/package.json'));
    writeFileSync(
      join(consumer, 'package.json'),
      JSON.stringify({
        private: true,
        packageManager: readJson(join(stage, 'package.json')).packageManager,
        dependencies: { [cli.name]: cli.version },
      }),
    );
    writeFileSync(
      join(consumer, 'pnpm-workspace.yaml'),
      [
        `registry: "${registry}/"`,
        'registries:',
        `  "${registry}/":`,
        '    scopes: ["@equinor"]',
        'overrides:',
        ...Object.keys(result).map(
          (name) => `  "${name}": "file:../tarballs/${basename(name)}.tgz"`,
        ),
        ...overrideLines('../source/.preview-inputs'),
      ].join('\n'),
    );
    pnpm(consumer, 'install', '--ignore-scripts');
    const cliRoot = realpathSync(join(consumer, 'node_modules', cli.name));
    const dependency = (root, name) =>
      realpathSync(join(root, '../..', `@equinor/fusion-framework-${name}`));
    const server = dependency(cliRoot, 'dev-server');
    for (const [root, suffix, js] of [
      [cliRoot, 'dev-portal', 'dist/main.js'],
      [server, 'vite-plugin-spa', 'dist/html/bootstrap.js'],
    ]) {
      const target = dependency(root, suffix);
      const { name, version } = readJson(join(target, 'package.json'));
      assert.equal(version, result[name].version);
      assert.equal(
        integrity(readFileSync(join(target, js))),
        integrity(
          execFileSync('tar', ['-xOf', join(out, `${basename(name)}.tgz`), `package/${js}`], {
            maxBuffer: 64 * 1024 ** 2,
          }),
        ),
        `${name}: CLI dependency is not the packed preview`,
      );
      console.log(`${basename(root)} resolves ${name}@${version} from the verified preview`);
    }
    const localManifest = `${JSON.stringify(
      {
        repository,
        commit,
        tag,
        upstream,
        stagedRanges,
        preservedEdges,
        packages: result,
      },
      null,
      2,
    )}\n`;
    // Preflight every version and tag before the first write.
    verifyHeads(commit, webCommit, reactCommit);
    const before = new Map();
    for (const [name, entry] of Object.entries(result)) {
      const info = await metadata(name);
      before.set(name, {
        exists: checkExisting(info, name, { ...entry, tag }),
        latest: info?.['dist-tags']?.latest,
        previous: info?.['dist-tags']?.['dark-mode'],
      });
    }
    for (const [name, entry] of Object.entries(result)) {
      if (!before.get(name).exists) {
        pnpm(
          stage,
          'publish',
          join(out, `${basename(name)}.tgz`),
          '--registry',
          registry,
          '--tag',
          tag,
          '--no-git-checks',
          ...(publish ? [] : ['--dry-run']),
        );
      }
      if (!publish) continue;
      const after = await metadata(name);
      assert.equal(
        after?.['dist-tags']?.latest,
        before.get(name).latest,
        `${name}: latest changed`,
      );
      assert.equal(
        after?.['dist-tags']?.['dark-mode'],
        before.get(name).previous,
        `${name}: old dark-mode tag changed`,
      );
      await download(name, { ...entry, tag }, after);
    }
    if (!publish) {
      console.log(`Verified ${planned.length} packed previews; nothing published`);
      return;
    }
    const temporary = `${output}.${process.pid}`;
    writeFileSync(temporary, localManifest, { mode: 0o600, flag: 'wx' });
    try {
      linkSync(temporary, output);
    } finally {
      rmSync(temporary);
    }
    console.log(`Verified ${planned.length} local packages from ${commit}; manifest: ${output}`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

function packedManifest(file) {
  return JSON.parse(
    execFileSync('tar', ['-xOf', file, 'package/package.json'], { encoding: 'utf8' }),
  );
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [commit, webCommit, reactCommit, publish, ...extra] = process.argv.slice(2);
  assert.ok(
    commit &&
      webCommit &&
      reactCommit &&
      !extra.length &&
      (publish === undefined || publish === '--publish'),
    'Usage: node .github/scripts/dark-mode-preview.mjs <framework SHA> <web SHA> <react SHA> [--publish]',
  );
  await preview(commit, webCommit, reactCommit, publish === '--publish');
}
