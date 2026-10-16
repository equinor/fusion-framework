import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';

const branchScript = new URL(
  '../actions/dependabot-maintenance-stream/manage-branch.sh',
  import.meta.url,
).pathname;

function runBranchOperation(operation, fixture = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'maintenance-branch-test-'));
  const callsPath = join(directory, 'calls.jsonl');
  writeFileSync(callsPath, '');
  const mock = `#!${process.execPath}
import { appendFileSync } from 'node:fs';
const args = process.argv.slice(2);
const fixture = JSON.parse(process.env.FIXTURE);
const tool = process.argv[1].endsWith('/gh') ? 'gh' : 'git';
appendFileSync(process.env.CALLS_PATH, JSON.stringify({ tool, args }) + '\\n');
if (tool === 'git') {
  if (args[0] === 'diff') process.exit(fixture.unpromoted ? 1 : 0);
  process.exit(0);
}
const endpoint = args[1];
if (args[0] === 'pr') {
  console.log(fixture.openPrs ?? 0);
} else if (endpoint === 'repos/test/repo') {
  console.log('main');
} else if (endpoint === 'repos/test/repo/git/ref/heads/main') {
  console.log('current-main-sha');
} else if (endpoint === 'repos/test/repo/git/ref/heads/maintenance/dependencies') {
  const status = fixture.status ?? 200;
  console.log('HTTP/2.0 ' + status);
  process.exit(status === 200 ? 0 : 1);
} else if (args[0] === 'api' && args[1] === '--method') {
  process.exit(fixture.writeFailure ? 1 : 0);
} else {
  console.error('Unexpected command', args);
  process.exit(1);
}
`;
  try {
    for (const tool of ['gh', 'git']) {
      writeFileSync(join(directory, tool), mock, { mode: 0o755 });
    }
    const result = spawnSync('bash', [branchScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        RUNNER_TEMP: directory,
        REPOSITORY: 'test/repo',
        MAINTENANCE_BRANCH: 'maintenance/dependencies',
        OPERATION: operation,
        FIXTURE: JSON.stringify(fixture),
        CALLS_PATH: callsPath,
      },
    });
    const calls = readFileSync(callsPath, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(JSON.parse);
    const writes = calls.filter(({ tool, args }) => tool === 'gh' && args.includes('--method'));
    return { ...result, calls, writes };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const operation of ['ensure', 'initialize', 'sync', 'reset']) {
  test(`${operation} recreates a missing branch from current main`, () => {
    const result = runBranchOperation(operation, { status: 404 });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(
      result.writes.map(({ args }) => args),
      [
        [
          'api',
          '--method',
          'POST',
          'repos/test/repo/git/refs',
          '--field',
          'ref=refs/heads/maintenance/dependencies',
          '--field',
          'sha=current-main-sha',
        ],
      ],
    );
    assert.equal(
      result.calls.some(({ tool }) => tool === 'git'),
      false,
    );
  });
}

test('ensure preserves an existing stream, including pending and unpromoted updates', () => {
  const result = runBranchOperation('ensure', { openPrs: 2, unpromoted: true });
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.writes, []);
  assert.equal(
    result.calls.some(({ tool }) => tool === 'git'),
    false,
  );
});

test('initialize rejects an existing branch', () => {
  const result = runBranchOperation('initialize');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /already exists/);
  assert.deepEqual(result.writes, []);
});

for (const status of [403, 429, 500]) {
  test(`API ${status} fails explicitly without recreating or resetting`, () => {
    const result = runBranchOperation('ensure', { status });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /Unable to check/);
    assert.deepEqual(result.writes, []);
  });
}

test('reset refuses open maintenance pull requests', () => {
  const result = runBranchOperation('reset', { openPrs: 1 });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Cannot reset while 1 pull request/);
  assert.deepEqual(result.writes, []);
});

test('reset refuses unpromoted changes', () => {
  const result = runBranchOperation('reset', { unpromoted: true });
  assert.equal(result.status, 1);
  assert.match(result.stdout, /unpromoted changes/);
  assert.deepEqual(result.writes, []);
});

test('reset force-updates an existing branch only after both guards pass', () => {
  const result = runBranchOperation('reset');
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(
    result.writes.map(({ args }) => args),
    [
      [
        'api',
        '--method',
        'PATCH',
        'repos/test/repo/git/refs/heads/maintenance/dependencies',
        '--field',
        'sha=current-main-sha',
        '-F',
        'force=true',
      ],
    ],
  );
});

test('branch creation failure is not reported as success', () => {
  const result = runBranchOperation('ensure', { status: 404, writeFailure: true });
  assert.equal(result.status, 1);
});

test('ruleset rejection of a reset is not reported as success', () => {
  const result = runBranchOperation('reset', { writeFailure: true });
  assert.equal(result.status, 1);
});

test('unknown operations cannot reset the maintenance branch', () => {
  const result = runBranchOperation('invalid');
  assert.equal(result.status, 1);
  assert.match(result.stdout, /Unknown maintenance operation/);
  assert.deepEqual(result.writes, []);
});

function withSyncRepository(run) {
  const directory = mkdtempSync(join(tmpdir(), 'maintenance-sync-test-'));
  const remote = join(directory, 'remote.git');
  const checkout = join(directory, 'checkout');
  const bin = join(directory, 'bin');
  const output = join(directory, 'output');
  const realGit = spawnSync('which', ['git'], { encoding: 'utf8' }).stdout.trim();
  const env = {
    ...process.env,
    GIT_CONFIG_NOSYSTEM: '1',
    GIT_CONFIG_GLOBAL: '/dev/null',
    GIT_AUTHOR_NAME: 'Maintenance test',
    GIT_AUTHOR_EMAIL: 'maintenance@example.test',
    GIT_COMMITTER_NAME: 'Maintenance test',
    GIT_COMMITTER_EMAIL: 'maintenance@example.test',
  };
  function git(...args) {
    const result = spawnSync(realGit, args, { cwd: checkout, env, encoding: 'utf8' });
    assert.equal(result.status, 0, result.stderr);
    return result.stdout.trim();
  }
  try {
    mkdirSync(checkout);
    mkdirSync(bin);
    git('init', '--bare', remote);
    git('init', '--initial-branch=main');
    git('remote', 'add', 'origin', remote);
    writeFileSync(join(checkout, 'shared.txt'), 'baseline\n');
    git('add', '.');
    git('commit', '-m', 'baseline');
    git('push', 'origin', 'main');
    git('switch', '-c', 'maintenance/dependencies');
    writeFileSync(join(checkout, 'dependency.txt'), 'accepted update\n');
    git('add', '.');
    git('commit', '-m', 'dependency update');
    git('push', 'origin', 'maintenance/dependencies');

    writeFileSync(
      join(bin, 'gh'),
      `#!${process.execPath}
const endpoint = process.argv[3];
if (endpoint === 'repos/test/repo') console.log('main');
else if (endpoint.endsWith('/main')) console.log('unused-main-sha');
else if (endpoint.endsWith('/maintenance/dependencies')) console.log('HTTP/2.0 200');
else process.exit(1);
`,
      { mode: 0o755 },
    );
    writeFileSync(
      join(bin, 'git'),
      `#!${process.execPath}
import { spawnSync } from 'node:child_process';
const args = process.argv.slice(2);
if (args.includes('push')) {
  if (process.env.REJECT_PUSH === 'true') {
    console.error('remote: branch rules rejected the push');
    process.exit(1);
  }
  if (process.env.CONCURRENT_SHA) {
    const advance = spawnSync(process.env.REAL_GIT, [
      '--git-dir', process.env.REMOTE,
      'update-ref', 'refs/heads/maintenance/dependencies', process.env.CONCURRENT_SHA,
    ], { stdio: 'inherit' });
    if (advance.status !== 0) process.exit(advance.status ?? 1);
  }
}
const result = spawnSync(process.env.REAL_GIT, args, { stdio: 'inherit' });
process.exit(result.status ?? 1);
`,
      { mode: 0o755 },
    );
    function sync(extraEnv = {}) {
      writeFileSync(output, '');
      const result = spawnSync('bash', [branchScript], {
        cwd: checkout,
        encoding: 'utf8',
        env: {
          ...env,
          PATH: `${bin}:${process.env.PATH}`,
          REAL_GIT: realGit,
          REMOTE: remote,
          RUNNER_TEMP: directory,
          GITHUB_OUTPUT: output,
          REPOSITORY: 'test/repo',
          MAINTENANCE_BRANCH: 'maintenance/dependencies',
          OPERATION: 'sync',
          ...extraEnv,
        },
      });
      return { ...result, output: readFileSync(output, 'utf8') };
    }
    run({ checkout, git, sync });
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('sync rebases real commits, preserves both changes, and disables repository hooks', () => {
  withSyncRepository(({ checkout, git, sync }) => {
    const previousHead = git('rev-parse', 'maintenance/dependencies');
    git('switch', 'main');
    writeFileSync(join(checkout, 'main.txt'), 'new main work\n');
    git('add', '.');
    git('commit', '-m', 'advance main');
    git('push', 'origin', 'main');
    for (const hook of ['post-checkout', 'pre-rebase', 'pre-push']) {
      writeFileSync(join(checkout, '.git', 'hooks', hook), '#!/bin/sh\nexit 1\n', {
        mode: 0o755,
      });
    }

    const result = sync();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, /updated=true\nhas-changes=true/);
    assert.notEqual(git('rev-parse', 'origin/maintenance/dependencies'), previousHead);
    git('merge-base', '--is-ancestor', 'main', 'origin/maintenance/dependencies');
    assert.equal(git('show', 'origin/maintenance/dependencies:dependency.txt'), 'accepted update');
    assert.equal(git('show', 'origin/maintenance/dependencies:main.txt'), 'new main work');
    assert.equal(
      git('log', '--format=%s', 'main..origin/maintenance/dependencies'),
      'dependency update',
    );
  });
});

test('sync does nothing when the maintenance branch already includes main', () => {
  withSyncRepository(({ git, sync }) => {
    const previousHead = git('rev-parse', 'origin/maintenance/dependencies');
    const result = sync({ REJECT_PUSH: 'true' });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /already includes main/);
    assert.equal(result.output, 'updated=false\nhas-changes=false\n');
    assert.equal(git('rev-parse', 'origin/maintenance/dependencies'), previousHead);
  });
});

test('sync fails on conflicting commits without changing the remote branch', () => {
  withSyncRepository(({ checkout, git, sync }) => {
    writeFileSync(join(checkout, 'shared.txt'), 'maintenance edit\n');
    git('add', '.');
    git('commit', '-m', 'maintenance conflict');
    git('push', 'origin', 'maintenance/dependencies');
    const previousHead = git('rev-parse', 'origin/maintenance/dependencies');
    git('switch', 'main');
    writeFileSync(join(checkout, 'shared.txt'), 'main edit\n');
    git('add', '.');
    git('commit', '-m', 'main conflict');
    git('push', 'origin', 'main');
    const result = sync();
    assert.equal(result.status, 1);
    assert.match(result.stdout, /resolve conflicts manually/);
    assert.equal(result.output, 'updated=false\nhas-changes=false\n');
    assert.equal(
      git('ls-remote', 'origin', 'refs/heads/maintenance/dependencies').split('\t')[0],
      previousHead,
    );
  });
});

test('sync cannot overwrite a concurrent maintenance update', () => {
  withSyncRepository(({ checkout, git, sync }) => {
    git('commit', '--allow-empty', '-m', 'concurrent dependency update');
    const concurrentHead = git('rev-parse', 'HEAD');
    // Make the object available remotely without moving the maintenance ref until push.
    git('push', 'origin', 'HEAD:refs/heads/concurrent-update');
    git('switch', 'main');
    writeFileSync(join(checkout, 'main.txt'), 'new main work\n');
    git('add', '.');
    git('commit', '-m', 'advance main');
    git('push', 'origin', 'main');
    const result = sync({ CONCURRENT_SHA: concurrentHead });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /stale info/);
    assert.equal(result.output, 'updated=false\nhas-changes=false\n');
    assert.equal(
      git('ls-remote', 'origin', 'refs/heads/maintenance/dependencies').split('\t')[0],
      concurrentHead,
    );
  });
});

test('sync reports a rejected push as failure', () => {
  withSyncRepository(({ git, sync }) => {
    const previousHead = git('rev-parse', 'origin/maintenance/dependencies');
    git('switch', 'main');
    git('commit', '--allow-empty', '-m', 'advance main');
    git('push', 'origin', 'main');
    const result = sync({ REJECT_PUSH: 'true' });
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /branch rules rejected/);
    assert.equal(result.output, 'updated=false\nhas-changes=false\n');
    assert.equal(
      git('ls-remote', 'origin', 'refs/heads/maintenance/dependencies').split('\t')[0],
      previousHead,
    );
  });
});

test('sync does not request promotion when the update is already on main', () => {
  withSyncRepository(({ git, sync }) => {
    git('switch', 'main');
    git('merge', '--squash', 'maintenance/dependencies');
    git('commit', '-m', 'promoted dependencies');
    git('push', 'origin', 'main');
    const result = sync();
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.output, /updated=true\nhas-changes=false/);
    assert.equal(git('rev-parse', 'origin/maintenance/dependencies'), git('rev-parse', 'main'));
  });
});
