// Opt-in local producer for the dark-mode PR. This is not a release workflow.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  globSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  realpathSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync,
} from 'node:fs';
import { homedir, tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { pathToFileURL } from 'node:url';

const registry = 'http://127.0.0.1:4873';
const config = join(homedir(), '.config/fusion-dark-mode');
const npmrc = join(config, 'npmrc');
const repository = 'equinor/fusion-framework';
const readJson = (file) => JSON.parse(readFileSync(file, 'utf8'));
const integrity = (bytes) => `sha512-${createHash('sha512').update(bytes).digest('base64')}`;

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
export function upstreamPackages(web, react) {
  const packages = new Map();
  for (const [producer, manifest] of [
    ['web', web],
    ['react', react],
  ]) {
    assert.equal(manifest.repository, `equinor/fusion-${producer}-components`);
    assert.match(manifest.commit, /^[a-f0-9]{40}$/);
    for (const [name, entry] of Object.entries(manifest.packages)) {
      assert.match(name, /^@equinor\/fusion-[a-z0-9-]+$/);
      assert.match(entry.version, /^\d+\.\d+\.\d+$/);
      assert.match(entry.integrity, /^sha512-[\w+/]{86}==$/);
      assert.ok(!packages.has(name), `Duplicate producer for ${name}`);
      packages.set(name, entry);
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
export function checkExisting(metadata, name, { version, integrity: expected }) {
  const existing = metadata?.versions?.[version];
  if (!existing) return false;
  assert.ok(
    metadata['dist-tags']?.['dark-mode'] === version && existing.dist.integrity === expected,
    `Immutable version conflict: ${name}@${version}. Do not overwrite or retag it.`,
  );
  return true;
}

async function preview(publish) {
  const packages = upstreamPackages(
    readJson(join(config, 'web.json')),
    readJson(join(config, 'react.json')),
  );
  assert.equal(statSync(npmrc).mode & 0o077, 0, 'Preview npmrc must be private');
  const settings = new Map(
    readFileSync(npmrc, 'utf8')
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
  const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
  const scratch = mkdtempSync(join(tmpdir(), 'fusion-framework-dark-mode-'));
  try {
    const stage = join(scratch, 'source');
    const out = join(scratch, 'tarballs');
    mkdirSync(stage);
    mkdirSync(out);
    const archive = join(scratch, 'source.tar');
    execFileSync('git', ['archive', '--output', archive, commit]);
    execFileSync('tar', ['-xf', archive, '-C', stage]);
    const inputs = join(stage, '.preview-inputs');
    mkdirSync(inputs);
    const overrides = [];
    for (const [name, entry] of packages) {
      const file = `${basename(name)}-${entry.version}.tgz`;
      writeFileSync(join(inputs, file), await download(name, entry, await metadata(name)));
      overrides.push(`  "${name}": "file:.preview-inputs/${file}"`);
    }
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
    const planned = [];
    for (const [dir, bump] of releases) {
      const cwd = join(stage, dir);
      const file = join(cwd, 'package.json');
      const pkg = readJson(file);
      assert.ok(
        !pkg.private && pkg.publishConfig?.access === 'public' && !pkg.publishConfig.registry,
      );
      pnpm(cwd, 'version', bump, '--no-git-tag-version');
      planned.push({ cwd, name: pkg.name, version: readJson(file).version });
    }
    pnpm(stage, 'install', '--no-frozen-lockfile');
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
      const copies = globSync(`node_modules/.pnpm/*/node_modules/${name}/package.json`, {
        cwd: stage,
      });
      assert.ok(copies.length, `${name} was not installed`);
      for (const copy of copies) {
        assert.ok(
          realpathSync(join(stage, copy)).startsWith(`${realpathSync(stage)}/node_modules/.pnpm/`),
        );
        assert.equal(readJson(join(stage, copy)).version, entry.version, `Wrong installed ${name}`);
        assert.equal(
          integrity(readFileSync(join(stage, copy, '..', js.slice('package/'.length)))),
          integrity(expected),
          `Installed JavaScript differs from the preview tarball: ${name}`,
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
    for (const { cwd, name, version } of planned) {
      const file = join(out, `${basename(name)}.tgz`);
      pnpm(cwd, 'pack', '--out', file);
      const packed = JSON.parse(
        execFileSync('tar', ['-xOf', file, 'package/package.json'], { encoding: 'utf8' }),
      );
      assert.equal(packed.name, name);
      assert.equal(packed.version, version);
      assert.ok(!packed.private && !packed.publishConfig?.registry);
      for (const field of ['dependencies', 'optionalDependencies', 'peerDependencies']) {
        for (const spec of Object.values(packed[field] ?? {})) {
          assert.doesNotMatch(spec, /workspace:|catalog:|file:|link:|127\.0\.0\.1/);
        }
      }
      if (name.endsWith('-react-ag-grid')) {
        assert.equal(packed.dependencies['@equinor/fusion-framework-module-ag-grid'], version);
      }
      result[name] = { version, integrity: integrity(readFileSync(file)) };
      checkExisting(await metadata(name), name, result[name]);
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
    if (!publish) {
      console.log(`Verified ${planned.length} packed previews; nothing published`);
      return;
    }
    // Preflight every version before the first write. Never use publish --force.
    for (const [name, entry] of Object.entries(result)) {
      const before = await metadata(name);
      if (!checkExisting(before, name, entry)) {
        pnpm(
          stage,
          'publish',
          join(out, `${basename(name)}.tgz`),
          '--registry',
          registry,
          '--userconfig',
          npmrc,
          '--tag',
          'dark-mode',
          '--no-git-checks',
        );
      }
      const after = await metadata(name);
      assert.equal(
        after?.['dist-tags']?.latest,
        before?.['dist-tags']?.latest,
        `${name}: latest changed`,
      );
      await download(name, entry, after);
    }
    const temporary = join(config, `framework.${process.pid}.json`);
    writeFileSync(
      temporary,
      `${JSON.stringify({ repository, commit, packages: result }, null, 2)}\n`,
      { mode: 0o600 },
    );
    renameSync(temporary, join(config, 'framework.json'));
    console.log(`Verified ${planned.length} local packages from ${commit}; wrote framework.json`);
  } finally {
    rmSync(scratch, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const args = process.argv.slice(2);
  assert.ok(
    !args.length || (args.length === 1 && args[0] === '--publish'),
    'Expected no arguments or --publish',
  );
  await preview(args.length === 1);
}
