import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
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
const prWorkflow = readFileSync(new URL('../workflows/pr.yml', import.meta.url), 'utf8');
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
process.stdout.write(process.env.FIXTURE_TOKEN);
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

test('acquires only the Fusion AI token with the existing caller Azure session', () => {
  const result = acquire();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(result.output, 'token=fixture-token\n');
  assert.deepEqual(result.calls, [
    [
      'account',
      'get-access-token',
      '--scope',
      '0ec6e8f2-d309-4316-90e6-1d05628b5f07/.default',
      '--query',
      'accessToken',
      '--output',
      'tsv',
    ],
  ]);
  assert.equal(result.stdout, '::add-mask::fixture-token\n');
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
    condition.trim(),
    {
      github,
      vars: { GREENKEEPER_MAINTENANCE_ENABLED: enabled },
      inputs,
      format: (pattern, value) => pattern.replace('{0}', value),
    },
    { timeout: 100 },
  );
}

test('automatic maintenance publishes while manual maintenance honors the explicit export choice', () => {
  const expression = workflow.match(/export-only: \$\{\{ (.+) \}\}/)?.[1];
  assert.ok(expression);
  for (const [event, exportOnly, expected] of [
    ['push', true, 'false'],
    ['workflow_dispatch', true, 'true'],
    ['workflow_dispatch', false, 'false'],
  ]) {
    assert.equal(
      runInNewContext(
        expression.replaceAll('inputs.export-only', 'inputs["export-only"]'),
        {
          github: { event_name: event },
          inputs: { 'export-only': exportOnly },
        },
        { timeout: 100 },
      ),
      expected,
    );
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
    const runner = jobCondition(workflow, 'maintain', github, enabled);
    assert.equal(Number(legacy) + Number(runner), 1);
    assert.equal(runner, enabled === 'true');
    assert.equal(jobCondition(workflow, 'disabled', github, enabled), !runner);
  });
}

test('manual exports and legacy recovery remain available before activation', () => {
  const github = {
    event_name: 'workflow_dispatch',
    ref: 'refs/heads/main',
    event: { repository: { default_branch: 'main' } },
  };
  assert.equal(jobCondition(workflow, 'maintain', github, ''), true);
  assert.equal(jobCondition(legacyWorkflow, 'manage-branch', github, 'true'), true);
});

test('handover preserves stream pushes and deletion recovery', () => {
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
        {
          event_name: event,
          ref,
          event: { repository: { default_branch: 'main' } },
        },
        'true',
      ),
      false,
    );
  }
});

test('authentication belongs to Framework and the runner receives separate read, APM and caller-write credentials', () => {
  assert.match(workflow, /environment: docs/);
  assert.match(workflow, /id-token: write/);
  assert.match(workflow, /client-id: \$\{\{ vars\.FUSION_AI_SP_CLIENT_ID \}\}/);
  assert.match(workflow, /github-token: \$\{\{ github\.token \}\}/);
  assert.match(workflow, /apm-token: \$\{\{ secrets\.APM_FUSION_SKILLS_TOKEN \}\}/);
  assert.match(workflow, /publish-token: \$\{\{ .+secrets\.DEPENDABOT_AUTOMATION_TOKEN/);
  assert.equal((workflow.match(/DEPENDABOT_AUTOMATION_TOKEN/g) ?? []).length, 1);
  assert.doesNotMatch(action, /GREENKEEPER_SOURCE_TOKEN/);
  assert.match(action, /uses: azure\/login@[0-9a-f]{40}/);
  assert.match(action, /client-id: \$\{\{ inputs\.client-id \}\}/);
  assert.match(action, /if: always\(\)/);
  assert.ok(
    action.indexOf('az logout') < action.indexOf('name: Run containerized dependency maintenance'),
  );
  assert.match(action, /az account clear/);
  assert.match(action, /run: bash "\$GITHUB_ACTION_PATH\/run-container\.sh"/);
  assert.match(action, /FUSION_AI_TOKEN: \$\{\{ steps\.ai\.outputs\.token \}\}/);
  assert.match(action, /FUSION_APM_TOKEN: \$\{\{ inputs\.apm-token \}\}/);
  assert.match(action, /GREENKEEPER_PUBLISH_TOKEN: \$\{\{ inputs\.publish-token \}\}/);
  assert.doesNotMatch(
    `${workflow}\n${prWorkflow}\n${action}`,
    /GREENKEEPER_SOURCE_TOKEN|GREENKEEPER_RUNNER_REF|\.\/\.greenkeeper\//,
  );
  assert.doesNotMatch(
    `${workflow}\n${action}`,
    /gh workflow run|dispatch_token|Actions write|environment: greenkeeper|setup-copilot|install-copilot|COPILOT_PROVIDER|provider-env|fusion-ai-base-url/,
  );
  assert.doesNotMatch(workflow, /^ {4}outputs:/m);
});

test('runner image is pinned and host policy preserves the populated stream', () => {
  const policy = readFileSync(new URL('../greenkeeper.yml', import.meta.url), 'utf8');
  assert.match(policy, /maintenance:\n {2}dependency:\n {4}branch: maintenance\/dependencies\n/);
  assert.match(workflow, /orchestrator-image: \$\{\{ vars\.GREENKEEPER_ORCHESTRATOR_IMAGE \}\}/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /task: dependency/);
  assert.match(workflow, /default: true/);
});

test('vendored conflict task and locked profile match Greenkeeper aaf28da', () => {
  for (const [file, hash] of [
    ['rebase-conflicts.md', '1297a04096614969c738c3378569b41087a2bdd3a3a8acbeeb89c0439129946f'],
    [
      'profiles/fusion-developer/apm.yml',
      'c8b550e3e62d66591e5b51139a710cc6823bee5e35f91bd0ec913be16d7e752e',
    ],
    [
      'profiles/fusion-developer/apm.lock.yaml',
      'c183923e1787bc9c8d5865d70ae42ee87b4cc4c26d26691b010453c77262a0e9',
    ],
  ]) {
    const bytes = readFileSync(
      new URL(`../actions/greenkeeper-maintenance/tasks/${file}`, import.meta.url),
    );
    assert.equal(createHash('sha256').update(bytes).digest('hex'), hash);
  }
});

test('pre-merge smoke test requires explicit manual selection and never receives the publisher', () => {
  for (const [event, selected, expected] of [
    ['workflow_dispatch', true, true],
    ['workflow_dispatch', false, false],
    ['pull_request', true, false],
    ['push', true, false],
  ]) {
    assert.equal(
      jobCondition(prWorkflow, 'greenkeeper-smoke', { event_name: event }, '', {
        greenkeeper_smoke: selected,
      }),
      expected,
    );
  }
  const smoke = prWorkflow.split('\n  greenkeeper-smoke:\n')[1]?.split('\n  required-check:\n')[0];
  assert.ok(smoke);
  assert.match(smoke, /environment: docs/);
  assert.match(smoke, /"\$CANDIDATE_SHA" == "\$GITHUB_SHA"/);
  assert.match(smoke, /export-only: 'true'/);
  assert.match(smoke, /preview-policy-revision: \$\{\{ inputs\.head_sha \}\}/);
  assert.match(smoke, /orchestrator-image: \$\{\{ inputs\.greenkeeper_orchestrator_image \}\}/);
  assert.doesNotMatch(smoke, /publish-token:|DEPENDABOT_AUTOMATION_TOKEN|contents: write/);
  const execution = smoke.split('- name: Test maintenance without a publishing credential')[1];
  assert.ok(execution);
  assert.match(execution, /apm-token: \$\{\{ secrets\.APM_FUSION_SKILLS_TOKEN \}\}/);
  assert.doesNotMatch(execution, /DEPENDABOT_AUTOMATION_TOKEN|GREENKEEPER_SOURCE_TOKEN/);
  assert.match(action, /PREVIEW_POLICY_REVISION: \$\{\{ inputs\.preview-policy-revision \}\}/);
});

test('GHCR preflight uses the job token and tests all three immutable images', () => {
  const smoke = prWorkflow.split('\n  greenkeeper-smoke:\n')[1]?.split('\n  required-check:\n')[0];
  assert.ok(smoke);
  const login = smoke
    .split('- name: Authenticate GHCR using the Framework job token')[1]
    ?.split('- name: Verify all pinned images')[0];
  assert.ok(login);
  assert.match(login, /password: \$\{\{ github\.token \}\}/);
  assert.doesNotMatch(login, /secrets\./);
  const pull = smoke
    .split('- name: Verify all pinned images')[1]
    ?.split('- name: Test maintenance')[0];
  const script = pull?.match(/^ {8}run: \|\n((?: {10}[^\n]*\n)+)/m)?.[1];
  assert.ok(script);
  for (const failedImage of ['', 'orchestrator', 'sandbox', 'gateway']) {
    const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-ghcr-test-'));
    writeFileSync(
      join(directory, 'docker'),
      `#!${process.execPath}
const fs = require('node:fs');
const [command, image] = process.argv.slice(2);
if (command !== 'pull') process.exit(2);
fs.appendFileSync(process.env.FIXTURE_LOG, image + '\\n');
process.exit(image === process.env.FAILED_IMAGE ? 1 : 0);
`,
      { mode: 0o755 },
    );
    try {
      const log = join(directory, 'pulls');
      const result = spawnSync('bash', ['-c', script], {
        encoding: 'utf8',
        env: {
          ...process.env,
          PATH: `${directory}:${process.env.PATH}`,
          SANDBOX_IMAGE: 'sandbox',
          GATEWAY_IMAGE: 'gateway',
          ORCHESTRATOR_IMAGE: 'orchestrator',
          FIXTURE_LOG: log,
          FAILED_IMAGE: failedImage,
        },
      });
      assert.equal(result.status, failedImage ? 1 : 0, result.stderr);
      assert.equal(readFileSync(log, 'utf8'), 'orchestrator\nsandbox\ngateway\n');
      if (failedImage) assert.match(result.stdout, /::error::/);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  }
});

test('smoke preflight validates the exact candidate and immutable pins before authentication', () => {
  const smoke = prWorkflow.split('\n  greenkeeper-smoke:\n')[1]?.split('\n  required-check:\n')[0];
  const script = smoke?.match(/^ {8}run: \|\n((?: {10}[^\n]*\n)+)/m)?.[1];
  assert.ok(script);
  const environment = {
    ...process.env,
    GITHUB_SHA: 'a'.repeat(40),
    CANDIDATE_SHA: 'a'.repeat(40),
    ORCHESTRATOR_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'b'.repeat(64)}`,
    SANDBOX_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'c'.repeat(64)}`,
    GATEWAY_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'d'.repeat(64)}`,
  };
  const valid = spawnSync('bash', ['-c', script], { env: environment, encoding: 'utf8' });
  assert.equal(valid.status, 0, valid.stderr);
  for (const [name, value] of [
    ['CANDIDATE_SHA', 'e'.repeat(40)],
    ['CANDIDATE_SHA', 'main'],
    ['ORCHESTRATOR_IMAGE', 'ghcr.io/equinor/fusion-poc-greenkeeper:latest'],
    ['SANDBOX_IMAGE', 'ghcr.io/equinor/fusion-poc-greenkeeper:latest'],
    ['GATEWAY_IMAGE', ''],
  ]) {
    const invalid = spawnSync('bash', ['-c', script], {
      env: { ...environment, [name]: value },
      encoding: 'utf8',
    });
    assert.notEqual(invalid.status, 0, `Unexpectedly accepted ${name}`);
    assert.match(invalid.stdout, /::error::/);
  }
});

function maintain(overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-container-test-'));
  const callsPath = join(directory, 'calls');
  const summaryPath = join(directory, 'summary');
  const image = `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'b'.repeat(64)}`;
  for (const command of ['gh', 'docker', 'stat']) {
    writeFileSync(
      join(directory, command),
      `#!${process.execPath}
    const fs = require('node:fs');
    const command = ${JSON.stringify(command)};
    const args = process.argv.slice(2);
    const previous = fs.existsSync(process.env.CALLS_PATH)
      ? fs.readFileSync(process.env.CALLS_PATH, 'utf8').trim().split('\\n').map(JSON.parse) : [];
    fs.appendFileSync(process.env.CALLS_PATH, JSON.stringify({
      command, args, publisher: process.env.GH_TOKEN === 'publisher-fixture'
    }) + '\\n');
    if (command === 'stat') { console.log('123'); process.exit(0); }
    if (command === 'docker') {
      if (args.includes('--dependency-branch')) console.log('maintenance/dependencies');
      if (args.includes('--rebase-branch') && process.env.EXECUTE_FAILURE === 'true') process.exit(17);
      process.exit(0);
    }
    const endpoint = args.find(arg => arg.startsWith('repos/'));
    if (args.includes('POST')) {
      console.log(JSON.stringify({ ref: 'refs/heads/maintenance/dependencies', object: { sha: 'a'.repeat(40) } }));
    } else if (endpoint.endsWith('/git/ref/heads/main')) {
      const moved = process.env.DEFAULT_MOVED === 'true' &&
        previous.some(call => call.command === 'gh' && call.args.includes(endpoint));
      console.log((moved ? 'c' : 'a').repeat(40));
    } else if (endpoint.includes('/contents/')) {
      console.log('version: 1\\nmaintenance:\\n  dependency:\\n    branch: maintenance/dependencies\\ntasks: []');
    } else if (endpoint.includes('/pulls?')) {
      console.log(process.env.NO_PRS === 'true' ? '[]' : JSON.stringify([
        { number: 42, user: { login: 'dependabot[bot]' }, head: { repo: { full_name: 'equinor/fusion-framework' } } }
      ]));
    } else if (endpoint.includes('/git/matching-refs/')) {
      console.log(process.env.MISSING_BRANCH === 'true' ? '[]' : JSON.stringify([
        { ref: 'refs/heads/maintenance/dependencies', object: { sha: 'd'.repeat(40) } }
      ]));
    } else if (endpoint.includes('/compare/')) {
      console.log(process.env.COMPARISON);
    } else if (endpoint === 'repos/equinor/fusion-framework') {
      console.log('main');
    } else { console.error('Unexpected API endpoint'); process.exit(2); }
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
          GITHUB_EVENT_NAME: 'workflow_dispatch',
          GITHUB_REF: 'refs/heads/candidate',
          GITHUB_SHA: 'a'.repeat(40),
          DEFAULT_BRANCH: 'main',
          TASK: 'dependency',
          EXPORT_ONLY: 'true',
          PREVIEW_POLICY_REVISION: 'a'.repeat(40),
          ORCHESTRATOR_IMAGE: image,
          GREENKEEPER_IMAGE: image,
          GREENKEEPER_GATEWAY_IMAGE: image,
          GH_TOKEN: 'read-fixture',
          FUSION_AI_TOKEN: 'ai-fixture',
          FUSION_APM_TOKEN: 'apm-fixture',
          GREENKEEPER_PUBLISH_TOKEN: '',
          COMPARISON: 'diverged',
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

test('container maintenance preserves policy freshness, isolation and export-only execution', () => {
  const result = maintain();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.summary, /Open Dependabot PRs: 1/);
  const execute = result.calls.find(
    (call) => call.command === 'docker' && call.args.includes('--rebase-branch'),
  );
  assert.ok(execute);
  assert.deepEqual(execute.args.slice(-6), [
    '--rebase-branch',
    'maintenance/dependencies',
    '--onto',
    'main',
    '--validation',
    'pnpm',
  ]);
  assert.ok(execute.args.includes('GREENKEEPER_POLICY_REVISION'));
  assert.ok(execute.args.includes('GREENKEEPER_EXPORT_ONLY'));
  assert.ok(execute.args.includes('FUSION_AI_TOKEN'));
  assert.ok(execute.args.includes('FUSION_APM_TOKEN'));
  assert.doesNotMatch(
    JSON.stringify(execute.args),
    /read-fixture|ai-fixture|apm-fixture|publisher-fixture/,
  );
  const mounts = execute.args.filter((_arg, index) => execute.args[index - 1] === '--mount');
  assert.ok(mounts.includes('type=bind,source=/var/run/docker.sock,target=/var/run/docker.sock'));
  assert.ok(mounts.some((arg) => arg.endsWith('target=/tasks,readonly')));
  const scratchMount = mounts.find((arg) => /source=.*greenkeeper-maintenance\./.test(arg));
  assert.ok(scratchMount);
  const [, source, target] = scratchMount.split(',');
  assert.equal(source.replace('source=', ''), target.replace('target=', ''));
  assert.ok(result.calls.every((call) => !call.args.includes('POST')));
});

for (const comparison of ['ahead', 'identical']) {
  test(`current dependency stream (${comparison}) does not start rebase or agents`, () => {
    const result = maintain({ COMPARISON: comparison });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.calls.every((call) => !call.args.includes('--rebase-branch')));
  });
}

test('export-only missing stream is proposed, not created', () => {
  const result = maintain({ MISSING_BRANCH: 'true' });
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.summary, /proposes creation/);
  assert.ok(
    result.calls.every(
      (call) => !call.args.includes('POST') && !call.args.includes('--rebase-branch'),
    ),
  );
});

test('production creation uses only the publisher and rechecks the default branch', () => {
  const result = maintain({
    PREVIEW_POLICY_REVISION: '',
    GITHUB_REF: 'refs/heads/main',
    EXPORT_ONLY: 'false',
    GREENKEEPER_PUBLISH_TOKEN: 'publisher-fixture',
    MISSING_BRANCH: 'true',
  });
  assert.equal(result.status, 0, result.stderr);
  const posts = result.calls.filter((call) => call.args.includes('POST'));
  assert.equal(posts.length, 1);
  assert.equal(posts[0].publisher, true);
  assert.ok(
    result.calls.filter((call) => !call.args.includes('POST')).every((call) => !call.publisher),
  );
});

test('default-branch movement prevents missing stream creation', () => {
  const result = maintain({
    PREVIEW_POLICY_REVISION: '',
    GITHUB_REF: 'refs/heads/main',
    EXPORT_ONLY: 'false',
    GREENKEEPER_PUBLISH_TOKEN: 'publisher-fixture',
    MISSING_BRANCH: 'true',
    DEFAULT_MOVED: 'true',
  });
  assert.notEqual(result.status, 0);
  assert.ok(result.calls.every((call) => !call.args.includes('POST')));
});

for (const [name, overrides] of [
  ['untrusted event', { GITHUB_EVENT_NAME: 'pull_request' }],
  ['non-default production ref', { PREVIEW_POLICY_REVISION: '' }],
  [
    'mutable orchestrator image',
    { ORCHESTRATOR_IMAGE: 'ghcr.io/equinor/fusion-poc-greenkeeper:latest' },
  ],
  ['wrong preview SHA', { PREVIEW_POLICY_REVISION: 'e'.repeat(40) }],
  ['preview publisher', { GREENKEEPER_PUBLISH_TOKEN: 'publisher-fixture' }],
  [
    'missing production publisher',
    { EXPORT_ONLY: 'false', PREVIEW_POLICY_REVISION: '', GITHUB_REF: 'refs/heads/main' },
  ],
]) {
  test(`container guard rejects ${name} before any external operation`, () => {
    const result = maintain(overrides);
    assert.notEqual(result.status, 0);
    assert.match(result.stderr, /::error::/);
    assert.deepEqual(result.calls, []);
  });
}

test('container execution failures propagate instead of reporting maintenance success', () => {
  const result = maintain({ EXECUTE_FAILURE: 'true' });
  assert.equal(result.status, 17);
});
