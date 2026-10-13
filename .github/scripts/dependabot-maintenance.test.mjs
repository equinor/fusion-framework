import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
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
    const calls = readFileSync(callsPath, 'utf8').trim().split('\n').map(JSON.parse);
    const writes = calls.filter(({ tool, args }) => tool === 'gh' && args.includes('--method'));
    return { ...result, calls, writes };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const operation of ['ensure', 'initialize', 'reset']) {
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
