import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const requestScript = new URL('../actions/greenkeeper-maintenance/request.sh', import.meta.url)
  .pathname;
const workflow = readFileSync(
  new URL('../workflows/greenkeeper-maintenance.yml', import.meta.url),
  'utf8',
);
const legacyWorkflow = readFileSync(
  new URL('../workflows/dependabot-maintenance.yml', import.meta.url),
  'utf8',
);

function request(overrides = {}, reject = false) {
  const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-request-test-'));
  const callsPath = join(directory, 'calls.jsonl');
  const summaryPath = join(directory, 'summary');
  writeFileSync(callsPath, '');
  writeFileSync(
    join(directory, 'gh'),
    `#!${process.execPath}
import { appendFileSync } from 'node:fs';
appendFileSync(process.env.CALLS_PATH, JSON.stringify({
  args: process.argv.slice(2),
  authorized: process.env.GH_TOKEN === 'fixture-automation'
}) + '\\n');
if (process.env.REJECT_REQUEST === 'true') {
  console.error('Dispatch authorization denied');
  process.exit(1);
}
`,
    { mode: 0o755 },
  );
  try {
    const result = spawnSync('bash', [requestScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        CALLS_PATH: callsPath,
        GITHUB_STEP_SUMMARY: summaryPath,
        GITHUB_REF: 'refs/heads/main',
        DEFAULT_BRANCH: 'main',
        GITHUB_EVENT_NAME: 'push',
        REPOSITORY: 'equinor/fusion-framework',
        GH_TOKEN: 'fixture-automation',
        TASK: 'dependency',
        EXPORT_ONLY: 'true',
        REJECT_REQUEST: String(reject),
        ...overrides,
      },
    });
    const calls = readFileSync(callsPath, 'utf8')
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(JSON.parse);
    const summary = existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8') : '';
    return { ...result, calls, summary };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

for (const exportOnly of ['true', 'false']) {
  test(`dispatches dependency maintenance with export-only=${exportOnly}`, () => {
    const result = request({ EXPORT_ONLY: exportOnly });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(result.calls, [
      {
        authorized: true,
        args: [
          'workflow',
          'run',
          'maintenance.yml',
          '--repo',
          'equinor/fusion-poc-greenkeeper',
          '--ref',
          'main',
          '-f',
          'repository=equinor/fusion-framework',
          '-f',
          'task=dependency',
          '-f',
          `export_only=${exportOnly}`,
        ],
      },
    ]);
    assert.match(result.summary, /Dispatch acceptance is not execution or validation success/);
  });
}

for (const [name, value] of [
  ['GH_TOKEN', ''],
  ['GITHUB_REF', 'refs/heads/feature'],
  ['GITHUB_EVENT_NAME', 'pull_request'],
  ['GITHUB_EVENT_NAME', 'pull_request_target'],
  ['TASK', 'unknown'],
  ['EXPORT_ONLY', 'yes'],
  ['REPOSITORY', 'outside/repository'],
]) {
  test(`rejects invalid ${name} without dispatching`, () => {
    const result = request({ [name]: value });
    assert.notEqual(result.status, 0);
    assert.deepEqual(result.calls, []);
    assert.equal(result.summary, '');
  });
}

test('dispatch authorization failure does not produce a success summary', () => {
  const result = request({}, true);
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Dispatch authorization denied/);
  assert.equal(result.calls.length, 1);
  assert.equal(result.summary, '');
});

function jobCondition(source, name, github, enabled) {
  const block = source.split(`\n  ${name}:\n`)[1]?.split(/\n {2}[a-z][\w-]*:\n/)[0];
  assert.ok(block, `Missing ${name} job`);
  const condition =
    block.match(/^ {4}if: >-\n((?: {6}.*\n)+)/m)?.[1] ?? block.match(/^ {4}if: ([^\n]+)/m)?.[1];
  assert.ok(condition, `Missing ${name} condition`);
  return runInNewContext(
    condition.trim(),
    {
      github,
      vars: { GREENKEEPER_MAINTENANCE_ENABLED: enabled },
      format: (pattern, value) => pattern.replace('{0}', value),
    },
    { timeout: 100 },
  );
}

test('automatic requests publish while manual requests honor the explicit export choice', () => {
  const expression = workflow.match(/export-only: \$\{\{ (.+) \}\}/)?.[1];
  assert.ok(expression);
  for (const [event, exportOnly, expected] of [
    ['push', true, 'false'],
    ['workflow_dispatch', true, 'true'],
    ['workflow_dispatch', false, 'false'],
  ]) {
    const result = runInNewContext(
      expression.replaceAll('inputs.export-only', 'inputs["export-only"]'),
      {
        github: { event_name: event },
        inputs: { 'export-only': exportOnly },
      },
      { timeout: 100 },
    );
    assert.equal(result, expected);
  }
});

for (const enabled of ['', 'false', 'true']) {
  test(`main-push maintenance has exactly one owner when enabled=${enabled || 'unset'}`, () => {
    const github = {
      event_name: 'push',
      ref: 'refs/heads/main',
      event: { repository: { default_branch: 'main' } },
    };
    const legacy = jobCondition(legacyWorkflow, 'manage-branch', github, enabled);
    const service = jobCondition(workflow, 'request', github, enabled);
    assert.equal(Number(legacy) + Number(service), 1);
    assert.equal(service, enabled === 'true');
    assert.equal(jobCondition(workflow, 'disabled', github, enabled), !service);
  });
}

test('manual export and legacy recovery remain available without enabling the automatic handover', () => {
  const github = {
    event_name: 'workflow_dispatch',
    ref: 'refs/heads/main',
    event: { repository: { default_branch: 'main' } },
  };
  assert.equal(jobCondition(workflow, 'request', github, ''), true);
  assert.equal(jobCondition(legacyWorkflow, 'manage-branch', github, 'true'), true);
});

test('service handover preserves maintenance-branch pushes and deletion recovery', () => {
  for (const event of ['push', 'delete']) {
    const github = {
      event_name: event,
      ref: event === 'push' ? 'refs/heads/maintenance/dependencies' : '',
      event: {
        ref_type: 'branch',
        ref: 'maintenance/dependencies',
        repository: { default_branch: 'main' },
      },
    };
    assert.equal(jobCondition(legacyWorkflow, 'manage-branch', github, 'true'), true);
    assert.equal(jobCondition(workflow, 'request', github, 'true'), false);
  }
});

test('host policy preserves the existing Dependabot stream and the caller uses only the external credential', () => {
  const policy = readFileSync(new URL('../greenkeeper.yml', import.meta.url), 'utf8');
  assert.match(policy, /maintenance:\n {2}dependency:\n {4}branch: maintenance\/dependencies\n/);
  assert.match(workflow, /task: dependency/);
  assert.match(workflow, /github-token: \$\{\{ secrets\.DEPENDABOT_AUTOMATION_TOKEN \}\}/);
  assert.doesNotMatch(
    workflow,
    /FUSION_AI_TOKEN|GREENKEEPER_BRANCH_TOKEN|secrets\.DEPENDABOT_AUTOMATION_TOKEN \|\|/,
  );
  assert.match(workflow, /default: true/);
  assert.match(workflow, /ref: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.match(workflow, /persist-credentials: false/);
  const action = readFileSync(
    new URL('../actions/greenkeeper-maintenance/action.yml', import.meta.url),
    'utf8',
  );
  assert.match(action, /GH_TOKEN: \$\{\{ inputs\.github-token \}\}/);
  assert.match(action, /TASK: \$\{\{ inputs\.task \}\}/);
  assert.match(action, /EXPORT_ONLY: \$\{\{ inputs\.export-only \}\}/);
  assert.match(action, /DEFAULT_BRANCH: \$\{\{ github\.event\.repository\.default_branch \}\}/);
  assert.doesNotMatch(action, /github\.token|secrets\.GITHUB_TOKEN/);
});
