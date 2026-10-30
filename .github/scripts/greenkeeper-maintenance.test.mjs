import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const tokenScript = new URL('../actions/greenkeeper-maintenance/acquire-token.sh', import.meta.url)
  .pathname;
const workflow = readFileSync(
  new URL('../workflows/greenkeeper-maintenance.yml', import.meta.url),
  'utf8',
);
const legacyWorkflow = readFileSync(
  new URL('../workflows/dependabot-maintenance.yml', import.meta.url),
  'utf8',
);
const reviewWorkflow = readFileSync(
  new URL('../workflows/dependabot-ai-review.yml', import.meta.url),
  'utf8',
);
const dependabot = readFileSync(new URL('../dependabot.yml', import.meta.url), 'utf8');
const action = readFileSync(
  new URL('../actions/greenkeeper-maintenance/action.yml', import.meta.url),
  'utf8',
);
function acquire(token = 'fixture-token', overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-token-test-'));
  const outputPath = join(directory, 'output');
  const callsPath = join(directory, 'calls');
  writeFileSync(
    join(directory, 'az'),
    `#!${process.execPath}
const fs = require('node:fs');
fs.appendFileSync(process.env.CALLS_PATH, JSON.stringify(process.argv.slice(2)) + '\\n');
if (process.env.AZ_FAILURE === 'true') {
  console.error('Azure token acquisition failed');
  process.exit(1);
}
const scope = process.argv[process.argv.indexOf('--scope') + 1];
process.stdout.write(scope.startsWith('667fbbb5-') ? (process.env.FIXTURE_MCP_TOKEN ?? 'mcp-fixture') : process.env.FIXTURE_TOKEN);
`,
    { mode: 0o755 },
  );
  try {
    const result = spawnSync('bash', [tokenScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        PATH: `${directory}:${process.env.PATH}`,
        RUNNER_TEMP: directory,
        AZURE_CONFIG_DIR: join(directory, 'greenkeeper-azure'),
        GITHUB_OUTPUT: outputPath,
        CALLS_PATH: callsPath,
        FIXTURE_TOKEN: token,
        AZ_FAILURE: 'false',
        ...overrides,
      },
    });
    return {
      ...result,
      output: existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '',
      calls: existsSync(callsPath)
        ? readFileSync(callsPath, 'utf8').trim().split('\n').map(JSON.parse)
        : [],
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('acquires separate Fusion AI and Fusion MCP tokens with the existing caller Azure session', () => {
  const result = acquire();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, 'token=fixture-token\nmcp-token=mcp-fixture\n');
  const call = (scope) => [
    'account',
    'get-access-token',
    '--scope',
    scope,
    '--query',
    'accessToken',
    '--output',
    'tsv',
  ];
  assert.deepEqual(result.calls, [
    call('0ec6e8f2-d309-4316-90e6-1d05628b5f07/.default'),
    call('667fbbb5-3c45-4dad-affe-6fe4e323bcde/.default'),
  ]);
  assert.equal(result.stdout, '::add-mask::fixture-token\n::add-mask::mcp-fixture\n');
});

test('rejects an empty MCP token without exporting either credential', () => {
  const result = acquire('fixture-token', { FIXTURE_MCP_TOKEN: '' });
  assert.notEqual(result.status, 0);
  assert.equal(result.output, '');
});

for (const [name, token] of [
  ['empty token', ''],
  ['multiline token', 'first\nsecond'],
  ['carriage return', 'first\rsecond'],
]) {
  test(`rejects ${name} without exporting a credential`, () => {
    const result = acquire(token);
    assert.notEqual(result.status, 0);
    assert.equal(result.output, '');
    assert.doesNotMatch(result.stdout, /::add-mask::/);
  });
}

test('rejects a nonisolated Azure configuration before requesting a token', () => {
  const result = acquire('fixture-token', { AZURE_CONFIG_DIR: '/unexpected-azure-session' });
  assert.notEqual(result.status, 0);
  assert.equal(result.output, '');
  assert.deepEqual(result.calls, []);
});

test('propagates Azure acquisition failures without exporting a token', () => {
  const result = acquire('fixture-token', { AZ_FAILURE: 'true' });
  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /Azure token acquisition failed/);
  assert.equal(result.output, '');
  assert.doesNotMatch(result.stdout, /fixture-token/);
});

function jobCondition(source, name, github, enabled, inputs = {}) {
  const block = source.split(`\n  ${name}:\n`)[1]?.split(/\n {2}[a-z][\w-]*:\n/)[0];
  assert.ok(block, `Missing ${name} job`);
  const condition =
    block.match(/^ {4}if: >-\n((?: {6}.*\n)+)/m)?.[1] ?? block.match(/^ {4}if: ([^\n]+)/m)?.[1];
  assert.ok(condition, `Missing ${name} condition`);
  return runInNewContext(
    // GitHub's object filter `labels.*.name` maps to a precomputed list in the fixture.
    condition.trim().replaceAll('labels.*.name', 'labelNames'),
    {
      github,
      vars: { GREENKEEPER_MAINTENANCE_ENABLED: enabled },
      inputs,
      format: (pattern, value) => pattern.replace('{0}', value),
      contains: (items, value) => items.includes(value),
    },
    { timeout: 100 },
  );
}

const push = {
  event_name: 'push',
  ref: 'refs/heads/main',
  event: { repository: { default_branch: 'main' } },
};

for (const enabled of ['', 'false', 'true']) {
  test(`main pushes have exactly one dependency maintainer when enabled=${enabled || 'unset'}`, () => {
    const legacy = jobCondition(legacyWorkflow, 'manage-branch', push, enabled);
    const runner = jobCondition(workflow, 'maintain', push, enabled);
    assert.equal(Number(legacy) + Number(runner), 1);
    assert.equal(runner, enabled === 'true');
    assert.equal(jobCondition(workflow, 'disabled', push, enabled), !runner);
  });
}

test('a schedule would run only when enabled, without a repository payload', () => {
  const schedule = {
    event_name: 'schedule',
    ref: 'refs/heads/main',
    event: { schedule: '17 5 * * 1-5' },
  };
  assert.equal(jobCondition(workflow, 'maintain', schedule, 'true'), true);
  assert.equal(jobCondition(workflow, 'maintain', schedule, ''), false);
  // The schedule trigger is commented out during evaluation; the job condition still supports it.
  assert.doesNotMatch(workflow, /^ {2}schedule:/m);
});

test('maintainers can dispatch a run from the default branch before activation', () => {
  const dispatch = { ...push, event_name: 'workflow_dispatch' };
  assert.equal(jobCondition(workflow, 'maintain', dispatch, ''), true);
  assert.equal(jobCondition(workflow, 'disabled', dispatch, ''), false);
});

test('non-default branches and PR events cannot acquire Framework credentials', () => {
  for (const [event, ref] of [
    ['workflow_dispatch', 'refs/heads/feature'],
    ['pull_request', 'refs/heads/main'],
    ['pull_request_target', 'refs/heads/main'],
  ]) {
    assert.equal(
      jobCondition(
        workflow,
        'maintain',
        { event_name: event, ref, event: { repository: { default_branch: 'main' } } },
        'true',
      ),
      false,
    );
  }
});

test('the stream drains: maintenance branch pushes and deletion recovery stay with the legacy workflow', () => {
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
    assert.equal(jobCondition(workflow, 'maintain', github, 'true'), false);
  }
});

test('npm Dependabot updates target the default branch', () => {
  const npm = dependabot.split('- package-ecosystem: "npm"')[1]?.split('- package-ecosystem:')[0];
  assert.ok(npm);
  assert.doesNotMatch(npm, /target-branch/);
  assert.doesNotMatch(dependabot, /maintenance\/dependencies/);
});

for (const [enabled, base, expected] of [
  ['true', 'main', false],
  ['true', 'maintenance/dependencies', true],
  ['', 'main', true],
]) {
  test(`legacy per-PR research for a PR on ${base} runs=${expected} when enabled=${enabled || 'unset'}`, () => {
    const github = {
      event_name: 'pull_request_target',
      action: 'opened',
      event: {
        action: 'opened',
        repository: { default_branch: 'main' },
        pull_request: { user: { login: 'dependabot[bot]' }, base: { ref: base }, labelNames: [] },
      },
    };
    assert.equal(jobCondition(reviewWorkflow, 'research', github, enabled), expected);
  });
}

test('authentication belongs to Framework and the runner receives separate read, APM and write credentials', () => {
  assert.match(workflow, /environment: docs/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /client-id: \$\{\{ vars\.FUSION_AI_SP_CLIENT_ID \}\}/);
  assert.match(workflow, /github-token: \$\{\{ github\.token \}\}/);
  assert.match(workflow, /apm-token: \$\{\{ secrets\.APM_FUSION_SKILLS_TOKEN \}\}/);
  assert.match(workflow, /publish-token: \$\{\{ secrets\.DEPENDABOT_AUTOMATION_TOKEN \}\}/);
  assert.equal((workflow.match(/DEPENDABOT_AUTOMATION_TOKEN/g) ?? []).length, 1);
  assert.match(workflow, /persist-credentials: false/);
  assert.doesNotMatch(workflow, /contents: write|pull-requests: write/);
  assert.match(action, /uses: azure\/login@[0-9a-f]{40}/);
  assert.match(action, /if: always\(\)/);
  assert.ok(
    action.indexOf('az logout') < action.indexOf('name: Run containerized dependency maintenance'),
  );
  assert.match(action, /FUSION_AI_TOKEN: \$\{\{ steps\.ai\.outputs\.token \}\}/);
  assert.match(action, /FUSION_MCP_TOKEN: \$\{\{ steps\.ai\.outputs\.mcp-token \}\}/);
  assert.match(action, /GREENKEEPER_PUBLISH_TOKEN: \$\{\{ inputs\.publish-token \}\}/);
  assert.doesNotMatch(
    `${workflow}\n${action}`,
    /export-only|preview-policy-revision|GREENKEEPER_RUNNER_REF/,
  );
});

test('the workflow follows the Greenkeeper main channel for all three images', () => {
  for (const [name, image] of [
    ['ORCHESTRATOR', 'orchestrator'],
    ['SANDBOX', 'sandbox-node'],
    ['GATEWAY', 'gateway'],
  ]) {
    assert.match(
      workflow,
      new RegExp(
        `GREENKEEPER_${name}_IMAGE: ghcr\\.io/equinor/fusion-poc-greenkeeper:${image}-main\\n`,
      ),
    );
  }
  assert.doesNotMatch(workflow, /vars\.GREENKEEPER_[A-Z_]*IMAGE/);
  assert.equal(existsSync(new URL('../greenkeeper.yml', import.meta.url)), false);
});

test('Greenkeeper task definitions come from the orchestrator image, not this repository', () => {
  assert.equal(
    existsSync(new URL('../actions/greenkeeper-maintenance/tasks', import.meta.url)),
    false,
  );
});

function maintain(overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-container-test-'));
  const callsPath = join(directory, 'calls');
  const summaryPath = join(directory, 'summary');
  const channel = (name) => `ghcr.io/equinor/fusion-poc-greenkeeper:${name}-main`;
  for (const command of ['gh', 'docker', 'stat']) {
    writeFileSync(
      join(directory, command),
      `#!${process.execPath}
const fs = require('node:fs');
const path = require('node:path');
const command = ${JSON.stringify(command)};
const args = process.argv.slice(2);
fs.appendFileSync(process.env.CALLS_PATH, JSON.stringify({ command, args, environment: {
  GREENKEEPER_REVISION: process.env.GREENKEEPER_REVISION, GREENKEEPER_MODEL: process.env.GREENKEEPER_MODEL,
  GREENKEEPER_WORKER_MODEL: process.env.GREENKEEPER_WORKER_MODEL, GREENKEEPER_TASKS_PATH: process.env.GREENKEEPER_TASKS_PATH ?? null,
  GREENKEEPER_IMAGE: process.env.GREENKEEPER_IMAGE, GREENKEEPER_GATEWAY_IMAGE: process.env.GREENKEEPER_GATEWAY_IMAGE,
  GREENKEEPER_DEBUG: process.env.GREENKEEPER_DEBUG
} }) + '\\n');
if (command === 'stat') { console.log('123'); process.exit(0); }
if (command === 'docker') {
  if (args[0] === 'image' && args[1] === 'inspect') {
    const reference = args[args.length - 1];
    const digit = reference.includes('orchestrator') ? '1' : reference.includes('sandbox') ? '2' : '3';
    if (process.env.UNRESOLVABLE !== 'true') console.log('ghcr.io/equinor/fusion-poc-greenkeeper@sha256:' + digit.repeat(64));
    process.exit(0);
  }
  if (args.includes('--task')) {
    const output = process.env.GREENKEEPER_OUTPUT_PATH;
    fs.mkdirSync(output, { recursive: true });
    fs.writeFileSync(path.join(output, 'dependency-run.md'), '## Greenkeeper combined dependency run\\n');
    if (process.env.EXECUTE_FAILURE === 'true') process.exit(17);
  }
  process.exit(0);
}
const endpoint = args.find(arg => arg.startsWith('repos/'));
if (endpoint === 'repos/equinor/fusion-framework') console.log('main');
else if (endpoint.endsWith('/git/ref/heads/main')) console.log('a'.repeat(40));
else { console.error('Unexpected API endpoint'); process.exit(2); }
`,
      { mode: 0o755 },
    );
  }
  try {
    const result = spawnSync(
      'bash',
      [new URL('../actions/greenkeeper-maintenance/run-container.sh', import.meta.url).pathname],
      {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          RUNNER_TEMP: directory,
          GITHUB_STEP_SUMMARY: summaryPath,
          CALLS_PATH: callsPath,
          GITHUB_REPOSITORY: 'equinor/fusion-framework',
          GITHUB_EVENT_NAME: 'push',
          GITHUB_REF: 'refs/heads/main',
          ORCHESTRATOR_IMAGE: channel('orchestrator'),
          GREENKEEPER_IMAGE: channel('sandbox-node'),
          GREENKEEPER_GATEWAY_IMAGE: channel('gateway'),
          GH_TOKEN: 'read-fixture',
          FUSION_AI_TOKEN: 'ai-fixture',
          FUSION_MCP_TOKEN: 'mcp-fixture',
          FUSION_APM_TOKEN: 'apm-fixture',
          GREENKEEPER_PUBLISH_TOKEN: 'publisher-fixture',
          ...overrides,
        },
      },
    );
    return {
      ...result,
      calls: existsSync(callsPath)
        ? readFileSync(callsPath, 'utf8').trim().split('\n').map(JSON.parse)
        : [],
      summary: existsSync(summaryPath) ? readFileSync(summaryPath, 'utf8') : '',
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('the container runs the combined dependency task at the confirmed default-branch commit', () => {
  const result = maintain();
  assert.equal(result.status, 0, result.stderr);
  const execute = result.calls.find(
    (call) => call.command === 'docker' && call.args.includes('--task'),
  );
  assert.ok(execute);
  assert.deepEqual(execute.args.slice(-4), ['--task', 'dependencies', '--mode', 'maintenance']);
  assert.deepEqual(execute.environment, {
    GREENKEEPER_REVISION: 'a'.repeat(40),
    GREENKEEPER_MODEL: 'gpt-6.1-sol',
    GREENKEEPER_WORKER_MODEL: 'gpt-6-luna',
    GREENKEEPER_TASKS_PATH: null,
    GREENKEEPER_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'2'.repeat(64)}`,
    GREENKEEPER_GATEWAY_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'3'.repeat(64)}`,
    GREENKEEPER_DEBUG: 'false',
  });
  assert.ok(execute.args.includes('GREENKEEPER_DEBUG'));
  // The run uses the resolved orchestrator digest, never the moving channel tag.
  assert.ok(
    execute.args.includes(`ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'1'.repeat(64)}`),
  );
  assert.ok(execute.args.every((arg) => !arg.endsWith('-main')));
  assert.match(
    result.summary,
    new RegExp(
      `orchestrator \`ghcr\\.io/equinor/fusion-poc-greenkeeper@sha256:${'1'.repeat(64)}\``,
    ),
  );
  for (const name of [
    'GREENKEEPER_PUBLISH_TOKEN',
    'FUSION_AI_TOKEN',
    'FUSION_MCP_TOKEN',
    'FUSION_APM_TOKEN',
    'GH_TOKEN',
    'GREENKEEPER_WORKER_MODEL',
  ]) {
    assert.ok(execute.args.includes(name), name);
  }
  assert.doesNotMatch(
    JSON.stringify(execute.args),
    /read-fixture|ai-fixture|mcp-fixture|apm-fixture|publisher-fixture/,
  );
  const mounts = execute.args.filter((_arg, index) => execute.args[index - 1] === '--mount');
  assert.ok(mounts.includes('type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock'));
  assert.ok(mounts.every((arg) => !arg.includes('target=/tasks')));
  assert.ok(!execute.args.includes('GREENKEEPER_TASKS_PATH'));
  const scratch = mounts.find((arg) => /source=.*greenkeeper-maintenance\./.test(arg));
  assert.ok(scratch);
  const [, source, target] = scratch.split(',');
  assert.equal(source.replace('source=', ''), target.replace('target=', ''));
  assert.match(result.summary, /greenkeeper\/dependencies/);
  assert.match(result.summary, /Greenkeeper combined dependency run/);
});

test('scheduled runs resolve the default branch without a repository payload', () => {
  const result = maintain({ GITHUB_EVENT_NAME: 'schedule' });
  assert.equal(result.status, 0, result.stderr);
});

test('container failures propagate after the run summary is recorded', () => {
  const result = maintain({ EXECUTE_FAILURE: 'true' });
  assert.equal(result.status, 17);
  assert.match(result.summary, /Greenkeeper combined dependency run/);
});

for (const [name, overrides] of [
  ['untrusted event', { GITHUB_EVENT_NAME: 'pull_request' }],
  ['non-default ref', { GITHUB_REF: 'refs/heads/feature' }],
  ['non-channel tag', { ORCHESTRATOR_IMAGE: 'ghcr.io/equinor/fusion-poc-greenkeeper:latest' }],
  ['image from another repository', { GREENKEEPER_IMAGE: 'ghcr.io/other/image:sandbox-node-main' }],
  ['missing publisher', { GREENKEEPER_PUBLISH_TOKEN: '' }],
  ['missing AI token', { FUSION_AI_TOKEN: '' }],
  ['missing MCP token', { FUSION_MCP_TOKEN: '' }],
]) {
  test(`container guard rejects ${name} before pulling or running images`, () => {
    const result = maintain(overrides);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /::error::/);
    assert.ok(result.calls.every((call) => call.command !== 'docker'));
  });
}

test('an image that does not resolve to a Greenkeeper digest stops the run before the orchestrator starts', () => {
  const result = maintain({ UNRESOLVABLE: 'true' });
  assert.notEqual(result.status, 0);
  assert.ok(
    result.calls.every((call) => !(call.command === 'docker' && call.args.includes('--task'))),
  );
});

test('pinned digests are still accepted to freeze a reviewed version', () => {
  const digest = `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'2'.repeat(64)}`;
  const result = maintain({ GREENKEEPER_IMAGE: digest });
  assert.equal(result.status, 0, result.stderr);
});

for (const [value, expected] of [
  ['true', 'true'],
  ['false', 'false'],
  ['', 'false'],
  ['yes', 'false'],
]) {
  test(`debug input ${value || 'unset'} reaches the orchestrator as ${expected}`, () => {
    const result = maintain({ GREENKEEPER_DEBUG: value });
    assert.equal(result.status, 0, result.stderr);
    const execute = result.calls.find(
      (call) => call.command === 'docker' && call.args.includes('--task'),
    );
    assert.equal(execute.environment.GREENKEEPER_DEBUG, expected);
  });
}

test('GitHub debug mode, not a separate input, enables Greenkeeper debug output', () => {
  assert.match(action, /GREENKEEPER_DEBUG: \$\{\{ runner\.debug == '1' \}\}/);
  assert.doesNotMatch(`${workflow}\n${action}`, /inputs\.debug|^ {2}debug:/m);
});
