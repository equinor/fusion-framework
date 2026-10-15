import assert from 'node:assert/strict';
import { mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, test } from 'node:test';
import {
  add,
  bootstrap,
  createContext,
  matchesTarget,
  normalizeTrustEntry,
  PLACEHOLDER_TAG,
  PLACEHOLDER_VERSION,
  parseGitHubRepository,
  parseJsonValues,
  preflight,
  validationTag,
  verify,
} from './npm-trusted-publishing.mjs';

const REPO = 'equinor/fusion-framework';
const trusted = {
  id: 'tp-1',
  type: 'github',
  repository: REPO,
  file: 'release.yml',
  environment: 'npm',
};

const pkg = (name, repository = REPO) => ({
  name,
  path: `packages/${name}`,
  directory: `packages/${name}`,
  repository,
});

/** Registry double: `packages` maps name -> { tags, versions }. */
function fakeFetch(packages) {
  return async (url, init = {}) => {
    if (init.method === 'HEAD') return { ok: true, status: 200 };
    if (packages[url]) return { ok: true, status: 200, json: async () => packages[url] };
    const path = decodeURIComponent(new URL(url).pathname.slice(1));
    const [scope, rest] = path.split('/', 2);
    const name = `${scope}/${rest}`;
    const version = path.split('/')[2];
    const entry = packages[name];
    if (!entry) return { ok: false, status: 404 };
    const body = version ? entry.versions?.[version] : { 'dist-tags': entry.tags };
    return body ? { ok: true, status: 200, json: async () => body } : { ok: false, status: 404 };
  };
}

/** npm CLI double; `handler(args, mode, options)` must return { status, stdout?, output? }. */
function fakeNpm(handler) {
  const calls = [];
  const run =
    (mode) =>
    (args, options = {}) => {
      calls.push({ mode, args, cwd: options.cwd });
      const result = handler(args, mode, options);
      return { stdout: '', ...result, output: result.output ?? result.stdout ?? '' };
    };
  return { calls, capture: run('capture'), interactive: run('interactive') };
}

function defaultNpm(trustByPackage = {}, overrides = () => undefined) {
  return fakeNpm((args, mode, options) => {
    const custom = overrides(args, mode, options);
    if (custom) return custom;
    if (args[0] === 'whoami') return { status: 0, stdout: 'maintainer\n' };
    if (args[0] === 'trust' && args[1] === 'github' && args[2] === '--help') {
      return { status: 0, output: '--allow-publish --allow-stage-publish' };
    }
    if (args[0] === 'trust' && args[1] === 'list') {
      return { status: 0, stdout: JSON.stringify(trustByPackage[args[2]] ?? []) };
    }
    return { status: 0 };
  });
}

function context({ packages, registry = {}, npm = defaultNpm(), confirm = async () => true } = {}) {
  const logs = [];
  const temp = [];
  const ctx = createContext({
    packages,
    npm,
    fetch: fakeFetch(registry),
    log: (message) => logs.push(message),
    sleep: async () => {},
    now: () => Date.parse('2026-10-15T00:00:00Z'),
    confirm,
    makeTempDir: () => {
      const directory = mkdtempSync(join(tmpdir(), 'npm-trust-test-'));
      temp.push(directory);
      return directory;
    },
    removeTempDir: () => {},
  });
  return {
    ctx,
    logs,
    npm,
    temp,
    cleanup: () => {
      for (const dir of temp) rmSync(dir, { recursive: true, force: true });
    },
  };
}

const published = (version = '1.0.0') => ({ tags: { latest: version } });
const mutations = (npm) =>
  npm.calls.filter(
    ({ args }) =>
      (args[0] === 'trust' && ['github', 'revoke'].includes(args[1]) && args[2] !== '--help') ||
      args[0] === 'publish',
  );

describe('parseGitHubRepository', () => {
  test('accepts npm repository formats and normalizes case', () => {
    assert.equal(
      parseGitHubRepository({ url: 'git+https://github.com/equinor/fusion-framework.git' }),
      REPO,
    );
    assert.equal(parseGitHubRepository('github:Equinor/Fusion-Framework'), REPO);
    assert.equal(parseGitHubRepository('equinor/fusion-framework'), REPO);
    assert.equal(
      parseGitHubRepository({ url: 'git@github.com:equinor/fusion-framework.git' }),
      REPO,
    );
  });

  test('rejects missing and non-GitHub repositories', () => {
    assert.equal(parseGitHubRepository(undefined), null);
    assert.equal(
      parseGitHubRepository({ url: 'https://gitlab.com/equinor/fusion-framework.git' }),
      null,
    );
  });
});

describe('trust list parsing', () => {
  test('reads arrays, concatenated documents and empty output', () => {
    assert.deepEqual(parseJsonValues(''), []);
    assert.equal(parseJsonValues('[{"id":"a"},{"id":"b"}]').length, 2);
    assert.deepEqual(
      parseJsonValues('{"id":"a","file":"x}.yml"}\n{"id":"b"}').map(({ id }) => id),
      ['a', 'b'],
    );
  });

  test('normalizes the registry claims shape', () => {
    const entry = normalizeTrustEntry({
      id: 'x',
      type: 'github',
      claims: { repository: REPO, workflow_ref: { file: 'release.yml' }, environment: 'npm' },
    });
    assert.ok(matchesTarget(entry));
  });

  test('requires the exact workflow, environment and a direct-publish permission', () => {
    assert.ok(matchesTarget(trusted));
    assert.ok(matchesTarget({ ...trusted, repository: 'Equinor/Fusion-Framework' }));
    assert.ok(!matchesTarget({ ...trusted, file: 'ci.yml' }));
    assert.ok(!matchesTarget({ ...trusted, environment: undefined }));
    assert.ok(!matchesTarget({ ...trusted, permissions: ['createStagedPackage'] }));
    assert.ok(matchesTarget({ ...trusted, permissions: ['createPackage', 'createStagedPackage'] }));
  });
});

describe('bootstrap', () => {
  test('adds missing trust, skips trusted, unpublished and misconfigured packages', async () => {
    const { ctx, npm, logs } = context({
      packages: [
        pkg('@equinor/a'),
        pkg('@equinor/b'),
        pkg('@equinor/new'),
        pkg('@equinor/fork', 'someone/fork'),
      ],
      registry: {
        '@equinor/a': published(),
        '@equinor/b': published(),
        '@equinor/fork': published(),
      },
      npm: defaultNpm({ '@equinor/a': [trusted] }),
    });

    const code = await bootstrap(ctx);

    assert.equal(code, 1, 'bad repository metadata is a failure');
    const changed = mutations(npm);
    assert.equal(changed.length, 1);
    assert.deepEqual(changed[0].args, [
      'trust',
      'github',
      '@equinor/b',
      '--repo',
      REPO,
      '--file',
      'release.yml',
      '--env',
      'npm',
      '--allow-publish',
      '--yes',
    ]);
    const output = logs.join('\n');
    assert.match(output, /\[already\]\s+@equinor\/a/);
    assert.match(output, /\[unpublished\]\s+@equinor\/new — use: pnpm npm-trust add @equinor\/new/);
    assert.match(output, /\[bad-repo\]\s+@equinor\/fork/);
    assert.match(output, /before 2026-10-17T00:00:00.000Z/);
    assert.match(output, /-f tag=trusted-publishing-20261015/);
  });

  test('dry run lists the change without mutating npm', async () => {
    const { ctx, npm } = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
    });
    assert.equal(await bootstrap(ctx, { dryRun: true }), 0);
    assert.equal(mutations(npm).length, 0);
  });

  test('falls back to an interactive run when npm requires 2FA', async () => {
    let unlocked = false;
    const npm = defaultNpm({}, (args, mode) => {
      if (args[0] !== 'trust' || args[1] !== 'list') return undefined;
      if (mode === 'interactive') unlocked = true;
      return unlocked ? { status: 0, stdout: '[]' } : { status: 1, output: 'npm error code EOTP' };
    });
    const { ctx } = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
      npm,
    });

    assert.equal(await bootstrap(ctx), 0);
    const listCalls = npm.calls.filter(({ args }) => args[1] === 'list').map(({ mode }) => mode);
    assert.deepEqual(listCalls, ['capture', 'interactive', 'capture']);
  });

  test("adds alongside existing configurations and only revokes this repository's stale ones with --replace", async () => {
    const stale = { id: 'old', type: 'github', repository: REPO, file: 'ci.yml' };
    const foreign = {
      id: 'other',
      type: 'github',
      repository: 'equinor/other',
      file: 'release.yml',
    };
    const { ctx, npm } = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
      npm: defaultNpm({ '@equinor/b': [stale, foreign] }),
    });

    assert.equal(await bootstrap(ctx, { replace: true }), 0);
    assert.deepEqual(
      mutations(npm).map(({ args }) =>
        args.slice(0, 2).concat(args[1] === 'revoke' ? args.slice(3) : []),
      ),
      [
        ['trust', 'github'],
        ['trust', 'revoke', '--id', 'old'],
      ],
      'adds before revoking and never touches other repositories',
    );
  });

  test('with --replace, revokes stale configurations even when the target is already trusted', async () => {
    const stale = { id: 'old', type: 'github', repository: REPO, file: 'ci.yml' };
    const foreign = { id: 'other', type: 'github', repository: 'equinor/other', file: 'ci.yml' };
    const setup = (npm) =>
      context({ packages: [pkg('@equinor/b')], registry: { '@equinor/b': published() }, npm });

    const plain = setup(defaultNpm({ '@equinor/b': [trusted, stale, foreign] }));
    assert.equal(await bootstrap(plain.ctx), 0);
    assert.equal(mutations(plain.npm).length, 0, 'without --replace nothing changes');

    const preview = setup(defaultNpm({ '@equinor/b': [trusted, stale, foreign] }));
    assert.equal(await bootstrap(preview.ctx, { replace: true, dryRun: true }), 0);
    assert.equal(mutations(preview.npm).length, 0);
    assert.match(
      preview.logs.join('\n'),
      /\[already\]\s+@equinor\/b — would revoke github:equinor\/fusion-framework\/ci\.yml/,
    );

    const cleaned = setup(defaultNpm({ '@equinor/b': [trusted, stale, foreign] }));
    assert.equal(await bootstrap(cleaned.ctx, { replace: true }), 0);
    assert.deepEqual(
      mutations(cleaned.npm).map(({ args }) => args),
      [['trust', 'revoke', '@equinor/b', '--id', 'old']],
      'only the stale same-repository entry is revoked',
    );

    const failing = setup(
      defaultNpm({ '@equinor/b': [trusted, stale] }, (args) =>
        args[1] === 'revoke' ? { status: 1, output: 'npm error code E500' } : undefined,
      ),
    );
    assert.equal(await bootstrap(failing.ctx, { replace: true }), 1);
    assert.match(
      failing.logs.join('\n'),
      /\[error\]\s+@equinor\/b — stale config kept: revoke .*E500/,
    );
  });

  test('reports a single-configuration conflict and swaps it only with --replace', async () => {
    const stale = { id: 'old', type: 'github', repository: REPO, file: 'ci.yml' };
    const conflictNpm = (responses) =>
      defaultNpm({ '@equinor/b': [stale] }, (args) =>
        args[0] === 'trust' && args[1] === 'github' && args[2] !== '--help'
          ? responses.shift()
          : undefined,
      );

    const blocked = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
      npm: conflictNpm([{ status: 1, output: 'npm error code E409' }]),
    });
    assert.equal(await bootstrap(blocked.ctx), 1);
    assert.match(blocked.logs.join('\n'), /\[conflict\].*--replace/);
    assert.equal(mutations(blocked.npm).filter(({ args }) => args[1] === 'revoke').length, 0);

    const swapped = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
      npm: conflictNpm([{ status: 1, output: 'npm error code E409' }, { status: 0 }]),
    });
    assert.equal(await bootstrap(swapped.ctx, { replace: true }), 0);
    assert.deepEqual(
      mutations(swapped.npm).map(({ args }) => args[1]),
      ['github', 'revoke', 'github'],
    );
  });

  test('stops the batch when a swapped package is left without trust', async () => {
    const stale = { id: 'old', type: 'github', repository: REPO, file: 'ci.yml' };
    const responses = [
      { status: 1, output: 'npm error code E409' },
      { status: 1, output: 'npm error code E429 rate limited' },
    ];
    const { ctx, npm, logs } = context({
      packages: [pkg('@equinor/b'), pkg('@equinor/c')],
      registry: { '@equinor/b': published(), '@equinor/c': published() },
      npm: defaultNpm({ '@equinor/b': [stale] }, (args) =>
        args[0] === 'trust' && args[1] === 'github' && args[2] === '@equinor/b'
          ? responses.shift()
          : undefined,
      ),
    });

    assert.equal(await bootstrap(ctx, { replace: true }), 1);
    assert.match(
      logs.join('\n'),
      /\[untrusted\]\s+@equinor\/b — revoked .*Rerun: pnpm npm-trust bootstrap --package @equinor\/b/,
    );
    assert.ok(
      !npm.calls.some(({ args }) => args.includes('@equinor/c') && args[1] === 'list'),
      'later packages are not touched',
    );
  });

  test('treats a 404 trust list as unconfigured and explains a 404 on add', async () => {
    const npm = defaultNpm({}, (args) => {
      if (args[0] !== 'trust' || args[2] === '--help') return undefined;
      if (args[1] === 'list') return { status: 1, output: 'npm error code E404' };
      if (args[1] === 'github') return { status: 1, output: 'npm error code E404' };
      return undefined;
    });
    const { ctx, logs } = context({
      packages: [pkg('@equinor/b')],
      registry: { '@equinor/b': published() },
      npm,
    });

    assert.equal(await bootstrap(ctx), 1);
    assert.equal(mutations(npm).length, 1, 'still attempts to add trust');
    assert.match(logs.join('\n'), /\[error\].*maintains this package/);
  });

  test('refuses to run without an npm login', async () => {
    const npm = defaultNpm({}, (args) =>
      args[0] === 'whoami' ? { status: 1, output: 'ENEEDAUTH' } : undefined,
    );
    const { ctx } = context({ packages: [pkg('@equinor/b')], npm });
    await assert.rejects(bootstrap(ctx), /npm login/);
  });
});

describe('add', () => {
  test('publishes a placeholder for a new package and then adds trust', async () => {
    const registry = {};
    const npm = defaultNpm({}, (args) => {
      if (args[0] === 'publish') registry['@equinor/new'] = published(PLACEHOLDER_VERSION);
      return undefined;
    });
    const { ctx, temp, cleanup } = context({ packages: [pkg('@equinor/new')], registry, npm });
    const manifests = [];
    ctx.removeTempDir = (directory) =>
      manifests.push(JSON.parse(readFileSync(join(directory, 'package.json'), 'utf8')));

    try {
      assert.equal(await add(ctx, { packages: ['@equinor/new'] }), 0);
    } finally {
      cleanup();
    }

    const [placeholder, trust] = mutations(npm);
    assert.deepEqual(placeholder.args, ['publish', '--access', 'public', '--tag', PLACEHOLDER_TAG]);
    assert.equal(placeholder.cwd, temp[0]);
    assert.equal(manifests[0].version, PLACEHOLDER_VERSION);
    assert.equal(manifests[0].repository.directory, 'packages/@equinor/new');
    assert.deepEqual(trust.args.slice(0, 3), ['trust', 'github', '@equinor/new']);
  });

  test('does not publish when the maintainer declines', async () => {
    const { ctx, npm } = context({ packages: [pkg('@equinor/new')], confirm: async () => false });
    assert.equal(await add(ctx, { packages: ['@equinor/new'] }), 1);
    assert.equal(mutations(npm).length, 0);
  });

  test('rejects names that are not public workspace packages', async () => {
    const { ctx } = context({ packages: [pkg('@equinor/a')] });
    await assert.rejects(
      add(ctx, { packages: ['@equinor/typo'] }),
      /Not a public workspace package/,
    );
  });
});

describe('verify', () => {
  const attestation = (repository, path) => ({
    attestations: [
      { predicateType: 'https://github.com/npm/attestation/tree/main/specs/publish/v0.1' },
      {
        predicateType: 'https://slsa.dev/provenance/v1',
        bundle: {
          dsseEnvelope: {
            payload: Buffer.from(
              JSON.stringify({
                predicate: {
                  buildDefinition: {
                    externalParameters: { workflow: { repository, path, ref: 'refs/heads/main' } },
                  },
                },
              }),
            ).toString('base64'),
          },
        },
      },
    ],
  });
  const oidc = (url) => ({
    _npmUser: { name: 'GitHub Actions', trustedPublisher: { id: 'github' } },
    dist: { attestations: { url, provenance: {} } },
  });

  test('requires a GitHub trusted publisher and provenance from release.yml in this repository', async () => {
    const { ctx, logs } = context({
      packages: [pkg('@equinor/a'), pkg('@equinor/b'), pkg('@equinor/c'), pkg('@equinor/d')],
      registry: {
        '@equinor/a': {
          tags: { snap: '1.0.1-snap' },
          versions: { '1.0.1-snap': oidc('https://att/a') },
        },
        'https://att/a': attestation(
          'https://github.com/equinor/fusion-framework',
          '.github/workflows/release.yml',
        ),
        '@equinor/b': {
          tags: { snap: '2.0.0-snap' },
          versions: { '2.0.0-snap': { _npmUser: { name: 'someone' }, dist: {} } },
        },
        '@equinor/c': { tags: { latest: '1.0.0' } },
        '@equinor/d': {
          tags: { snap: '3.0.0-snap' },
          versions: { '3.0.0-snap': oidc('https://att/d') },
        },
        'https://att/d': attestation(
          'https://github.com/equinor/fusion-framework',
          '.github/workflows/ci.yml',
        ),
      },
    });

    assert.equal(await verify(ctx, { tag: 'snap' }), 1);
    const output = logs.join('\n');
    assert.match(output, /\[verified\]\s+@equinor\/a — 1\.0\.1-snap \(refs\/heads\/main\)/);
    assert.match(
      output,
      /\[not-oidc\]\s+@equinor\/b — 2\.0\.0-snap published by someone without provenance/,
    );
    assert.match(output, /\[no-tag\]\s+@equinor\/c/);
    assert.match(output, /\[wrong-source\]\s+@equinor\/d — .*ci\.yml/);
  });

  test('suggests a dated snapshot tag so older runs cannot satisfy verification', () => {
    assert.equal(validationTag(Date.parse('2026-10-15T12:00:00Z')), 'trusted-publishing-20261015');
  });
});

describe('preflight', () => {
  test('passes when every package exists and points at this repository', async () => {
    const { ctx } = context({
      packages: [pkg('@equinor/a')],
      registry: { '@equinor/a': published() },
    });
    assert.equal(await preflight(ctx), 0);
  });

  test('fails before publishing when a package is new or misconfigured', async () => {
    const { ctx, logs } = context({
      packages: [pkg('@equinor/a', null), pkg('@equinor/new')],
      registry: { '@equinor/a': published() },
    });
    assert.equal(await preflight(ctx), 1);
    assert.match(logs.join('\n'), /::error::@equinor\/a: repository must point at/);
    assert.match(
      logs.join('\n'),
      /::error::@equinor\/new: not on npm yet.*pnpm npm-trust add @equinor\/new/,
    );
  });
});
