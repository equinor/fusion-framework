import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { test } from 'node:test';

const script = fileURLToPath(new URL('../actions/greenkeeper-dispatch/dispatch.sh', import.meta.url));
const pull = {
  state: 'open', user: { login: 'dependabot[bot]' },
  base: { repo: { full_name: 'equinor/fusion-framework' } },
  head: { sha: 'a'.repeat(40), repo: { full_name: 'equinor/fusion-framework' } },
};

function dispatch(overrides = {}, metadata = pull) {
  const directory = mkdtempSync(join(tmpdir(), 'framework-dispatch-'));
  const calls = join(directory, 'calls');
  const summary = join(directory, 'summary');
  writeFileSync(join(directory, 'gh'), `#!${process.execPath}
const fs = require('node:fs');
const args = process.argv.slice(2);
const post = args.includes('POST');
fs.appendFileSync(process.env.CALLS, JSON.stringify({args, token: process.env.GH_TOKEN}) + '\\n');
if (!post && process.env.API_FAILURE === 'true') process.exit(19);
if (post && process.env.DISPATCH_FAILURE === 'true') process.exit(23);
if (!post) console.log(process.env.PULL);
`, { mode: 0o755 });
  try {
    const result = spawnSync('bash', [script], {
      encoding: 'utf8', timeout: 10_000,
      env: {
        ...process.env, PATH: `${directory}:${process.env.PATH}`, CALLS: calls, PULL: JSON.stringify(metadata),
        GITHUB_REPOSITORY: 'equinor/fusion-framework', GITHUB_EVENT_NAME: 'workflow_dispatch',
        GITHUB_REF: 'refs/heads/main', GITHUB_RUN_ID: '123', GITHUB_RUN_ATTEMPT: '2',
        GITHUB_STEP_SUMMARY: summary, PR_NUMBER: '5941',
        GH_TOKEN: 'framework-read-fixture', GREENKEEPER_DISPATCH_TOKEN: 'poc-dispatch-fixture',
        ...overrides,
      },
    });
    return {
      ...result,
      calls: existsSync(calls) ? readFileSync(calls, 'utf8').trim().split('\n').map(JSON.parse) : [],
      summary: existsSync(summary) ? readFileSync(summary, 'utf8') : '',
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('Framework reads the PR then dispatches only identifiers to PoC main using a separate token', () => {
  const result = dispatch();
  assert.equal(result.status, 0, result.stderr);
  assert.deepEqual(result.calls, [
    { args: ['api', 'repos/equinor/fusion-framework/pulls/5941'], token: 'framework-read-fixture' },
    {
      args: ['api', '--method', 'POST',
        'repos/equinor/fusion-poc-greenkeeper/actions/workflows/dependency-assessment.yml/dispatches',
        '-f', 'ref=main', '-f', 'inputs[pr-number]=5941', '-f', `inputs[head-sha]=${'a'.repeat(40)}`,
        '-f', 'inputs[caller-run]=https://github.com/equinor/fusion-framework/actions/runs/123/attempts/2'],
      token: 'poc-dispatch-fixture',
    },
  ]);
  assert.match(result.summary, /not an assessment result/);
  assert.doesNotMatch(result.summary + result.stdout + result.stderr, /poc-dispatch-fixture|framework-read-fixture/);
});

for (const overrides of [
  { GITHUB_REPOSITORY: 'other/repository' }, { GITHUB_EVENT_NAME: 'pull_request_target' },
  { GITHUB_REF: 'refs/heads/topic' }, { PR_NUMBER: '../1' }, { PR_NUMBER: '1\ninjection' },
  { GITHUB_RUN_ID: 'bad' }, { GITHUB_RUN_ATTEMPT: '' }, { GH_TOKEN: '' }, { GREENKEEPER_DISPATCH_TOKEN: '' },
]) {
  test(`invalid caller context stops before API access: ${JSON.stringify(overrides)}`, () => {
    const result = dispatch(overrides);
    assert.notEqual(result.status, 0);
    assert.equal(result.calls.length, 0);
    assert.equal(result.summary, '');
    assert.match(result.stderr, /::error::/);
  });
}

for (const metadata of [
  { ...pull, state: 'closed' }, { ...pull, user: { login: 'human' } },
  { ...pull, base: { repo: { full_name: 'other/repository' } } },
  { ...pull, head: { ...pull.head, repo: { full_name: 'other/fork' } } },
  { ...pull, head: { ...pull.head, sha: 'short' } },
]) {
  test(`unreviewable metadata cannot dispatch: ${JSON.stringify(metadata)}`, () => {
    const result = dispatch({}, metadata);
    assert.notEqual(result.status, 0);
    assert.equal(result.calls.length, 1);
    assert.equal(result.summary, '');
  });
}

for (const [overrides, status, callCount] of [
  [{ API_FAILURE: 'true' }, 19, 1], [{ DISPATCH_FAILURE: 'true' }, 23, 2],
]) {
  test(`API failure propagates without a success summary: ${JSON.stringify(overrides)}`, () => {
    const result = dispatch(overrides);
    assert.equal(result.status, status);
    assert.equal(result.calls.length, callCount);
    assert.equal(result.summary, '');
  });
}

test('Framework workflow requests no provider identity or write-enabled job token', () => {
  const workflow = readFileSync(new URL('../workflows/greenkeeper-dependency-assessment.yml', import.meta.url), 'utf8');
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /environment: docs/);
  assert.match(workflow, /github\.repository == 'equinor\/fusion-framework' && github\.ref == 'refs\/heads\/main'/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /secrets\.GREENKEEPER_DISPATCH_TOKEN/);
  assert.match(workflow, /bash \.github\/actions\/greenkeeper-dispatch\/dispatch\.sh/);
  assert.doesNotMatch(workflow, /id-token:|packages:|: write|pull_request_target:|schedule:|azure\/|dotnet|docker/);
});
