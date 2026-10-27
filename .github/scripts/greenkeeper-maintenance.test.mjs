import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { runInNewContext } from 'node:vm';

const providerScript = new URL(
  '../actions/greenkeeper-maintenance/prepare-provider.sh',
  import.meta.url,
).pathname;
const workflow = readFileSync(
  new URL('../workflows/greenkeeper-maintenance.yml', import.meta.url),
  'utf8',
);
const legacyWorkflow = readFileSync(
  new URL('../workflows/dependabot-maintenance.yml', import.meta.url),
  'utf8',
);
const action = readFileSync(
  new URL('../actions/greenkeeper-maintenance/action.yml', import.meta.url),
  'utf8',
);
const validProvider = [
  'export COPILOT_PROVIDER_BEARER_TOKEN=fixture-token',
  'export COPILOT_PROVIDER_BASE_URL=https://ai.api.fusion.equinor.com/openai/v1',
].join('\n');

function prepare(provider = validProvider, overrides = {}) {
  const directory = mkdtempSync(join(tmpdir(), 'greenkeeper-provider-test-'));
  const providerPath = join(directory, 'copilot-provider-fixture.env');
  const outputPath = join(directory, 'output');
  if (provider !== null) {
    writeFileSync(providerPath, provider, { mode: 0o600 });
  }
  try {
    const result = spawnSync('bash', [providerScript], {
      encoding: 'utf8',
      env: {
        ...process.env,
        RUNNER_TEMP: directory,
        PROVIDER_ENV: providerPath,
        GITHUB_OUTPUT: outputPath,
        COPILOT_PROVIDER_BEARER_TOKEN: '',
        COPILOT_PROVIDER_BASE_URL: '',
        ...overrides,
      },
    });
    return {
      ...result,
      output: existsSync(outputPath) ? readFileSync(outputPath, 'utf8') : '',
      providerRemains: existsSync(providerPath),
    };
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('consumes and deletes the caller-acquired provider file within the same job', () => {
  const result = prepare();
  assert.equal(result.status, 0, result.stderr);
  assert.equal(
    result.output,
    'token=fixture-token\nbase-url=https://ai.api.fusion.equinor.com/openai/v1\n',
  );
  assert.equal(result.providerRemains, false);
  assert.equal(result.stdout, '::add-mask::fixture-token\n');
});

for (const [name, provider] of [
  ['missing provider file', null],
  ['missing token', 'export COPILOT_PROVIDER_BASE_URL=https://example.com'],
  [
    'insecure endpoint',
    'export COPILOT_PROVIDER_BEARER_TOKEN=fixture-token\nexport COPILOT_PROVIDER_BASE_URL=http://example.com',
  ],
  [
    'multiline token',
    "export COPILOT_PROVIDER_BEARER_TOKEN=$'first\\nsecond'\nexport COPILOT_PROVIDER_BASE_URL=https://example.com",
  ],
]) {
  test(`rejects ${name} without exporting a credential`, () => {
    const result = prepare(provider);
    assert.notEqual(result.status, 0);
    assert.equal(result.output, '');
    assert.equal(result.providerRemains, false);
  });
}

test('refuses an unexpected provider path without deleting the actual provider file', () => {
  const result = prepare(validProvider, { PROVIDER_ENV: '/not-a-provider-file' });
  assert.notEqual(result.status, 0);
  assert.equal(result.output, '');
  assert.equal(result.providerRemains, true);
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
  assert.match(action, /uses: \.\/\.github\/actions\/setup-copilot-fusion-ai/);
  assert.match(action, /uses: \.\/\.greenkeeper\/\.github\/actions\/maintenance/);
  assert.match(action, /fusion-ai-token: \$\{\{ steps\.provider\.outputs\.token \}\}/);
  assert.match(action, /apm-token: \$\{\{ inputs\.apm-token \}\}/);
  assert.match(action, /publish-token: \$\{\{ inputs\.publish-token \}\}/);
  assert.doesNotMatch(
    `${workflow}\n${action}`,
    /gh workflow run|dispatch_token|Actions write|environment: greenkeeper/,
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
