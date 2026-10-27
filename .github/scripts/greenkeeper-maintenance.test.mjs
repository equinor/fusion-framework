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
  assert.match(workflow, /publish-token: \$\{\{ secrets\.DEPENDABOT_AUTOMATION_TOKEN \}\}/);
  assert.match(workflow, /token: \$\{\{ secrets\.GREENKEEPER_SOURCE_TOKEN \}\}/);
  assert.equal((workflow.match(/DEPENDABOT_AUTOMATION_TOKEN/g) ?? []).length, 1);
  assert.doesNotMatch(action, /GREENKEEPER_SOURCE_TOKEN/);
  assert.match(action, /uses: azure\/login@[0-9a-f]{40}/);
  assert.match(action, /client-id: \$\{\{ inputs\.client-id \}\}/);
  assert.match(action, /if: always\(\)/);
  assert.ok(
    action.indexOf('az logout') < action.indexOf('name: Run shared dependency maintenance'),
  );
  assert.match(action, /az account clear/);
  assert.match(action, /uses: \.\/\.greenkeeper\/\.github\/actions\/maintenance/);
  assert.match(action, /fusion-ai-token: \$\{\{ steps\.ai\.outputs\.token \}\}/);
  assert.match(action, /apm-token: \$\{\{ inputs\.apm-token \}\}/);
  assert.match(action, /publish-token: \$\{\{ inputs\.publish-token \}\}/);
  assert.doesNotMatch(
    `${workflow}\n${action}`,
    /gh workflow run|dispatch_token|Actions write|environment: greenkeeper|setup-copilot|install-copilot|COPILOT_PROVIDER|provider-env|fusion-ai-base-url/,
  );
  assert.doesNotMatch(workflow, /^ {4}outputs:/m);
});

test('runner source is pinned and host policy preserves the populated stream', () => {
  const policy = readFileSync(new URL('../greenkeeper.yml', import.meta.url), 'utf8');
  assert.match(policy, /maintenance:\n {2}dependency:\n {4}branch: maintenance\/dependencies\n/);
  assert.match(workflow, /RUNNER_REF.*=~ \^\[0-9a-f\]\{40\}\$/);
  assert.match(workflow, /ref: \$\{\{ vars\.GREENKEEPER_RUNNER_REF \}\}/);
  assert.match(workflow, /repository: equinor\/fusion-poc-greenkeeper/);
  assert.match(workflow, /persist-credentials: false/);
  assert.match(workflow, /task: dependency/);
  assert.match(workflow, /default: true/);
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
  assert.match(smoke, /token: \$\{\{ secrets\.GREENKEEPER_SOURCE_TOKEN \}\}/);
  assert.equal((smoke.match(/GREENKEEPER_SOURCE_TOKEN/g) ?? []).length, 2);
  assert.doesNotMatch(smoke, /publish-token:|DEPENDABOT_AUTOMATION_TOKEN|contents: write/);
  const execution = smoke.split('- name: Test maintenance without a publishing credential')[1];
  assert.ok(execution);
  assert.match(execution, /apm-token: \$\{\{ secrets\.APM_FUSION_SKILLS_TOKEN \}\}/);
  assert.doesNotMatch(execution, /DEPENDABOT_AUTOMATION_TOKEN|GREENKEEPER_SOURCE_TOKEN/);
  assert.match(action, /preview-policy-revision: \$\{\{ inputs\.preview-policy-revision \}\}/);
});

test('smoke preflight validates the exact candidate and immutable pins before authentication', () => {
  const smoke = prWorkflow.split('\n  greenkeeper-smoke:\n')[1]?.split('\n  required-check:\n')[0];
  const script = smoke?.match(/^ {8}run: \|\n((?: {10}[^\n]*\n)+)/m)?.[1];
  assert.ok(script);
  const environment = {
    ...process.env,
    GITHUB_SHA: 'a'.repeat(40),
    CANDIDATE_SHA: 'a'.repeat(40),
    RUNNER_REF: 'b'.repeat(40),
    SANDBOX_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'c'.repeat(64)}`,
    GATEWAY_IMAGE: `ghcr.io/equinor/fusion-poc-greenkeeper@sha256:${'d'.repeat(64)}`,
  };
  const valid = spawnSync('bash', ['-c', script], { env: environment, encoding: 'utf8' });
  assert.equal(valid.status, 0, valid.stderr);
  for (const [name, value] of [
    ['CANDIDATE_SHA', 'e'.repeat(40)],
    ['CANDIDATE_SHA', 'main'],
    ['RUNNER_REF', 'main'],
    ['SANDBOX_IMAGE', 'ghcr.io/equinor/fusion-poc-greenkeeper:latest'],
    ['GATEWAY_IMAGE', ''],
  ]) {
    const invalid = spawnSync('bash', ['-c', script], {
      env: { ...environment, [name]: value },
      encoding: 'utf8',
    });

    for (const status of ['200', '401', '403', '404']) {
      test(`source diagnostic reports HTTP ${status} without exposing credentials or response bodies`, () => {
        const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-source-test-'));
        const script = new URL(
          '../actions/greenkeeper-maintenance/check-source-access.sh',
          import.meta.url,
        ).pathname;
        writeFileSync(
          join(directory, 'curl'),
          `#!${process.execPath}
    const fs = require('node:fs');
    const args = process.argv.slice(2);
    fs.writeFileSync(args[args.indexOf('--dump-header') + 1],
      'HTTP/2 ' + process.env.FIXTURE_STATUS + '\\r\\nX-Accepted-GitHub-Permissions: contents=read\\r\\n');
    fs.writeFileSync(args[args.indexOf('--output') + 1], 'private-source-fixture');
    process.stdout.write(process.env.FIXTURE_STATUS);
    `,
          { mode: 0o755 },
        );
        try {
          const result = spawnSync('bash', [script], {
            encoding: 'utf8',
            env: {
              ...process.env,
              PATH: `${directory}:${process.env.PATH}`,
              RUNNER_TEMP: directory,
              RUNNER_REF: 'a'.repeat(40),
              GH_TOKEN: 'secret-fixture-not-for-output',
              FIXTURE_STATUS: status,
            },
          });
          assert.equal(result.status, status === '200' ? 0 : 1, result.stderr);
          assert.match(result.stdout, new RegExp(`HTTP ${status}`));
          assert.match(result.stdout, /contents=read/);
          assert.doesNotMatch(
            result.stdout + result.stderr,
            /secret-fixture-not-for-output|private-source-fixture/,
          );
          assert.equal(
            (result.stdout.match(/Greenkeeper source API:/g) ?? []).length,
            status === '200' ? 2 : 1,
          );
        } finally {
          rmSync(directory, { recursive: true, force: true });
        }
      });
    }
    assert.notEqual(invalid.status, 0, `Unexpectedly accepted ${name}`);
    assert.match(invalid.stdout, /::error::/);
  }
});
