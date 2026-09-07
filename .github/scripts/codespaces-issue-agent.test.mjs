/** biome-ignore-all lint/suspicious/noUndeclaredEnvVars: Tests supply explicit Actions inputs, not Turbo task inputs. */
import { execFileSync, spawnSync } from 'node:child_process';
import { appendFileSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { Readable } from 'node:stream';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  checkPath,
  checkResult,
  checkToken,
  remoteMain,
  run,
  runWorkflow,
} from './codespaces-issue-agent.mjs';

vi.mock('node:child_process', () => ({ execFileSync: vi.fn(), spawnSync: vi.fn() }));
vi.mock('node:fs', () => ({
  appendFileSync: vi.fn(),
  mkdirSync: vi.fn(),
  readFileSync: vi.fn(),
  writeFileSync: vi.fn(),
}));

const base = 'a'.repeat(40);
/**
 * Produce fake expiring claims without acquiring any real credentials.
 * @param minutes - Remaining lifetime.
 * @param claims - Extra unverified claims.
 * @returns A deliberately unsigned test token.
 */
const token = (minutes, claims = {}) =>
  `header.${Buffer.from(JSON.stringify({ exp: Date.now() / 1000 + minutes * 60, ...claims })).toString('base64url')}.signature`;
const report =
  '**Why is this change needed?**\nAn issue.\n**Review guidance:**\nCheck it.\n### Checklist\n- [x] Agent claim';
const result = { exitCode: 0, patch: 'mock patch', report };

beforeEach(() => {
  vi.resetAllMocks();
  for (const [key, value] of Object.entries({
    ISSUE_NUMBER: '123',
    COPILOT_PROVIDER_WIRE_MODEL: 'gpt-5.6-sol',
    BASE_SHA: base,
    BASE_BRANCH: 'main',
    GITHUB_RUN_ID: '10',
    GITHUB_RUN_ATTEMPT: '1',
    TASK_BRANCH: 'automation/issue-123-10-1',
    GH_TOKEN: 'mock-owner-token',
    FUSION_MCP_TOKEN: token(60, { scp: 'mcp' }),
    CODESPACE_NAME: 'mock-codespace',
    RESULT_PATH: '/mock/result.json',
    GITHUB_STEP_SUMMARY: '/mock/summary',
  }))
    vi.stubEnv(key, value);
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [{ key: 'ai', uri: 'https://example.invalid/ai/', scopes: ['mock-scope'] }],
    }),
  );
  execFileSync.mockImplementation((command, args) => {
    if (command === 'az') return token(60);
    if (command === 'git') {
      if (args.includes('rev-parse')) return base;
      if (args.includes('--name-only')) return 'packages/example/src/index.ts\0';
      if (args.includes('ls-files')) return `100644 ${base} 0\tpackages/example/src/index.ts`;
      if (args.includes('show')) return Buffer.from('export const value = 1;\n');
      return '';
    }
    if (args[0] === 'codespace') return JSON.stringify(result);
    if (args.includes('--include')) return 'HTTP/2 200\r\n\r\n{"type":"User"}';
    if (args.includes('--paginate')) return '[[{"body":"Do not interpolate $(commands)"}]]';
    return JSON.stringify({
      sha: base,
      tree: { sha: base },
      state: 'open',
      html_url: 'https://example.invalid/pr/1',
    });
  });
  readFileSync.mockImplementation((path) =>
    path.endsWith('result.json') ? JSON.stringify(result) : report,
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('workflow credential and output guards', () => {
  it.each(['', 'unknown-model'])(
    'rejects unsupported model %j before any command',
    async (model) => {
      vi.stubEnv('COPILOT_PROVIDER_WIRE_MODEL', model);
      await expect(runWorkflow('preflight')).rejects.toThrow('supported Fusion AI model');
      expect(execFileSync).not.toHaveBeenCalled();
    },
  );

  it.each(['0', '-1', '1; echo unsafe', '123\n', '001', '1e3', ''])(
    'rejects issue input %j before any command',
    async (issue) => {
      vi.stubEnv('ISSUE_NUMBER', issue);
      vi.stubEnv('TASK_BRANCH', `automation/issue-${issue}-10-1`);
      await expect(runWorkflow('preflight')).rejects.toThrow('Invalid workflow inputs');
      expect(execFileSync).not.toHaveBeenCalled();
    },
  );

  it('accepts sufficient delegated-token lifetime and rejects missing, malformed, or expired tokens', () => {
    expect(checkToken(token(60, { scp: 'mcp' }), 45).scp).toBe('mcp');
    for (const value of [undefined, '', 'broken', token(-1), token(10)]) {
      expect(() => checkToken(value, 25)).toThrow();
    }
  });

  it('checks explicit owner access without interactive authentication', async () => {
    await runWorkflow('preflight');
    expect(execFileSync).toHaveBeenCalledWith(
      'gh',
      ['api', '--include', '/user'],
      expect.anything(),
    );
    vi.stubEnv('GH_TOKEN', '');
    execFileSync.mockClear();
    await expect(runWorkflow('preflight')).rejects.toThrow('missing explicit GitHub token');
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('rejects app-only MCP tokens and expired opaque GitHub tokens', async () => {
    vi.stubEnv('FUSION_MCP_TOKEN', token(60));
    await expect(runWorkflow('preflight')).rejects.toThrow('user-delegated');
    vi.stubEnv('FUSION_MCP_TOKEN', token(60, { scp: 'mcp' }));
    execFileSync.mockReturnValue(
      'HTTP/2 200\r\nGitHub-Authentication-Token-Expiration: 2020-01-01\r\n\r\n{"type":"User"}',
    );
    await expect(runWorkflow('preflight')).rejects.toThrow('Refresh the Codespaces token');
  });

  it.each([{ type: 'Bot' }, { state: 'closed' }, { state: 'open', pull_request: {} }])(
    'rejects unsupported owner or issue %j',
    async (response) => {
      const original = execFileSync.getMockImplementation();
      execFileSync.mockImplementation((command, args, options) => {
        if (response.type && args.includes('--include'))
          return `HTTP/2 200\r\n\r\n${JSON.stringify(response)}`;
        if (!response.type && args[1]?.endsWith('/issues/123')) return JSON.stringify(response);
        return original(command, args, options);
      });
      await expect(runWorkflow('preflight')).rejects.toThrow();
      expect(execFileSync.mock.calls.some(([, args]) => args[0] === 'codespace')).toBe(false);
    },
  );

  it('withholds raw subprocess errors and credential-bearing artifacts', () => {
    execFileSync.mockImplementation(() => {
      throw new Error('mock secret in stderr');
    });
    expect(() => run('gh', ['api', '/user'])).toThrow('output withheld');
    for (const invalid of [
      null,
      {},
      { ...result, exitCode: 1 },
      { ...result, patch: '' },
      { ...result, report: 'eyJhbGciOiJub25lIn0.eyJleHAiOjF9.signature' },
      { ...result, report: 'mock-owner-token' },
      { ...result, patch: 'x'.repeat(2 * 1024 * 1024) },
    ])
      expect(() => checkResult(invalid, ['mock-owner-token'])).toThrow();
    expect(() => checkResult(result)).not.toThrow();
  });
});

describe('merged task cleanup', () => {
  let pr;
  let origin;
  let spaces;
  beforeEach(() => {
    vi.stubEnv('PR_NUMBER', '456');
    pr = {
      merged: true,
      base: { ref: 'main' },
      head: { ref: 'automation/issue-123-10-1', repo: { id: 7 } },
    };
    origin = {
      path: '.github/workflows/codespaces-issue-agent.yml',
      event: 'workflow_dispatch',
      repository: { id: 7 },
      head_branch: 'main',
    };
    spaces = [
      {
        name: 'task-codespace',
        repository: { id: 7 },
        display_name: 'issue-123-10-1',
        git_status: { ref: pr.head.ref },
      },
    ];
    execFileSync.mockImplementation((_command, args) => {
      if (args.includes('DELETE')) return '';
      if (args.includes('--paginate'))
        return JSON.stringify([{ codespaces: [] }, { codespaces: spaces }]);
      if (args[1].includes('/pulls/')) return JSON.stringify(pr);
      if (args[1].includes('/actions/')) return JSON.stringify(origin);
      return '{"id":7,"default_branch":"main"}';
    });
  });

  it('deletes exactly the owner-visible workspace matching the merged task and originating run', async () => {
    await runWorkflow('cleanup');
    expect(
      execFileSync.mock.calls.filter(([, args]) => args.includes('DELETE')).map(([, args]) => args),
    ).toEqual([['api', '/user/codespaces/task-codespace', '--method', 'DELETE']]);
  });

  it.each(['unmerged', 'fork', 'other-base', 'other-branch'])('ignores %s PRs', async (kind) => {
    if (kind === 'unmerged') pr.merged = false;
    if (kind === 'fork') pr.head.repo.id = 8;
    if (kind === 'other-base') pr.base.ref = 'release';
    if (kind === 'other-branch') pr.head.ref = 'feature/change';
    await runWorkflow('cleanup');
    expect(
      execFileSync.mock.calls.some(
        ([, args]) => args.includes('--paginate') || args.includes('DELETE'),
      ),
    ).toBe(false);
  });

  it.each(['repository', 'display_name'])('ignores a mismatched %s', async (field) => {
    spaces[0][field] = field === 'repository' ? { id: 8 } : 'personal';
    await runWorkflow('cleanup');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('DELETE'))).toBe(false);
  });

  it('requires owner inspection if the matched workspace has switched branches', async () => {
    spaces[0].git_status.ref = 'other';
    await expect(runWorkflow('cleanup')).rejects.toThrow('owner must inspect');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('DELETE'))).toBe(false);
  });

  it.each([
    ['PR_NUMBER', '../123'],
    ['GH_TOKEN', ''],
  ])('requires valid %s before API access', async (key, value) => {
    vi.stubEnv(key, value);
    await expect(runWorkflow('cleanup')).rejects.toThrow('explicit Codespaces owner token');
    expect(execFileSync).not.toHaveBeenCalled();
  });

  it('succeeds without deletion when retention already removed the workspace', async () => {
    spaces = [];
    await runWorkflow('cleanup');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('DELETE'))).toBe(false);
  });

  it('rejects ambiguous identities and untrusted originating workflows', async () => {
    spaces.push({ ...spaces[0], name: 'duplicate' });
    await expect(runWorkflow('cleanup')).rejects.toThrow('Ambiguous');
    spaces.pop();
    origin.path = '.github/workflows/other.yml';
    await expect(runWorkflow('cleanup')).rejects.toThrow('trusted issue-agent');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('DELETE'))).toBe(false);
  });

  it('surfaces deletion failure without attempting another workspace', async () => {
    const original = execFileSync.getMockImplementation();
    execFileSync.mockImplementation((command, args, options) => {
      if (args.includes('DELETE')) throw new Error('API unavailable');
      return original(command, args, options);
    });
    await expect(runWorkflow('cleanup')).rejects.toThrow('withheld');
    expect(execFileSync.mock.calls.filter(([, args]) => args.includes('DELETE'))).toHaveLength(1);
  });
});

describe('memory-only remote invocation', () => {
  it.each(['gpt-5.6-sol', 'gpt-5.6-luna'])('forwards the selected deployment %s', async (model) => {
    vi.stubEnv('COPILOT_PROVIDER_WIRE_MODEL', model);
    await runWorkflow('generate');
    const [, , options] = execFileSync.mock.calls.find(([, args]) => args[0] === 'codespace');
    expect(JSON.parse(options.input).env.COPILOT_PROVIDER_WIRE_MODEL).toBe(model);
  });

  it('sends runtime credentials and issue JSON only through SSH stdin', async () => {
    await runWorkflow('generate');
    const [, args, options] = execFileSync.mock.calls.find(([, args]) => args[0] === 'codespace');
    const payload = JSON.parse(options.input);
    expect(args.join(' ')).not.toContain(process.env.FUSION_MCP_TOKEN);
    expect(args.join(' ')).not.toContain('mock-owner-token');
    expect(args.join(' ')).not.toContain(payload.env.COPILOT_PROVIDER_BEARER_TOKEN);
    expect(payload.env.FUSION_MCP_TOKEN).toBe(process.env.FUSION_MCP_TOKEN);
    expect(payload.env).not.toHaveProperty('GH_TOKEN');
    expect(payload.env).toMatchObject({
      COPILOT_PROVIDER_BASE_URL: 'https://example.invalid/ai',
      COPILOT_PROVIDER_TYPE: 'azure',
      COPILOT_PROVIDER_MODEL_ID: 'gpt-5.4',
      COPILOT_PROVIDER_WIRE_MODEL: 'gpt-5.6-sol',
      COPILOT_PROVIDER_AZURE_API_VERSION: '2025-01-01-preview',
      COPILOT_PROVIDER_WIRE_API: 'completions',
    });
    expect(
      execFileSync.mock.calls.filter(([command]) => command === 'az').map(([, args]) => args),
    ).toEqual([
      [
        'account',
        'get-access-token',
        '--scope',
        '5a842df8-3238-415d-b168-9f16a6a6031b/.default',
        '--query',
        'accessToken',
        '-o',
        'tsv',
      ],
      [
        'account',
        'get-access-token',
        '--scope',
        'mock-scope',
        '--query',
        'accessToken',
        '-o',
        'tsv',
      ],
    ]);
    expect(fetch).toHaveBeenCalledWith(
      'https://discovery.fusion.equinor.com/service-registry/environments/fprd/services',
      expect.objectContaining({
        headers: { Authorization: expect.stringMatching(/^Bearer header\./) },
      }),
    );
    expect(payload.prompt).toContain('$(commands)');
    expect(payload.base).toBe(base);
    expect(writeFileSync).toHaveBeenCalledWith('/mock/result.json', JSON.stringify(result), {
      mode: 0o600,
    });
  });

  it.each([
    { ok: false },
    { ok: true, json: async () => [] },
    { ok: true, json: async () => [{ key: 'ai', uri: 'http://example.invalid', scopes: ['s'] }] },
    { ok: true, json: async () => [{ key: 'ai', uri: 'https://example.invalid', scopes: [] }] },
  ])('fails closed before SSH on invalid Fusion-AI discovery', async (response) => {
    fetch.mockResolvedValue(response);
    await expect(runWorkflow('generate')).rejects.toThrow();
    expect(execFileSync.mock.calls.some(([, args]) => args[0] === 'codespace')).toBe(false);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('rejects expired inference tokens before SSH without credential fallback', async () => {
    const original = execFileSync.getMockImplementation();
    execFileSync.mockImplementation((command, args, options) =>
      command === 'az' && args.includes('mock-scope')
        ? token(-1)
        : original(command, args, options),
    );
    await expect(runWorkflow('generate')).rejects.toThrow('Refresh the access token');
    expect(execFileSync.mock.calls.some(([, args]) => args[0] === 'codespace')).toBe(false);
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('writes no artifact when SSH fails or the CLI output contains a runtime token', async () => {
    execFileSync.mockImplementationOnce(() => {
      throw new Error('SSH/credential error');
    });
    await expect(runWorkflow('generate')).rejects.toThrow('withheld');
    expect(writeFileSync).not.toHaveBeenCalled();
    execFileSync.mockImplementation((command, args) => {
      if (command === 'az') return token(60);
      if (args[0] === 'codespace')
        return JSON.stringify({ ...result, report: process.env.FUSION_MCP_TOKEN });
      return args.includes('--paginate') ? '[]' : '{"state":"open"}';
    });
    await expect(runWorkflow('generate')).rejects.toThrow('credential-bearing');
    expect(writeFileSync).not.toHaveBeenCalled();
  });

  it('runs normal noninteractive Copilot with only the provider in secret-env-vars', async () => {
    vi.spyOn(process, 'chdir').mockImplementation(() => {});
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      Readable.from([
        JSON.stringify({
          base,
          branch: 'automation/issue-123-10-1',
          prompt: 'Implement locally',
          env: { COPILOT_PROVIDER_BEARER_TOKEN: 'mock-provider', FUSION_MCP_TOKEN: 'mock-mcp' },
        }),
      ]),
    );
    spawnSync.mockReturnValue({ status: 0, stdout: report });
    const write = vi.spyOn(process.stdout, 'write').mockImplementation(() => true);
    await remoteMain();
    write.mockRestore();
    const [command, args, options] = spawnSync.mock.calls[0];
    expect(command).toBe('gh');
    expect(args).toContain('--no-ask-user');
    expect(args).toContain('--allow-all');
    expect(args).toContain('--secret-env-vars=COPILOT_PROVIDER_BEARER_TOKEN');
    expect(args).not.toContain('--available-tools');
    expect(args.join(' ')).not.toContain('mock-provider');
    expect(options.env.FUSION_MCP_TOKEN).toBe('mock-mcp');
    expect(options.stdio[0]).toBe('ignore');
  });

  it.each(['wrong-base', 'dirty'])('rejects a %s checkout before Copilot', async (failure) => {
    vi.spyOn(process, 'chdir').mockImplementation(() => {});
    vi.spyOn(process, 'stdin', 'get').mockReturnValue(
      Readable.from([JSON.stringify({ base, branch: 'automation/issue-123-10-1', env: {} })]),
    );
    execFileSync.mockReturnValue(failure === 'dirty' ? base : 'b'.repeat(40));
    await expect(remoteMain()).rejects.toThrow('Expected clean approved base');
    expect(spawnSync).not.toHaveBeenCalled();
  });

  it.each([{ status: 1 }, { status: null, signal: 'SIGKILL', error: new Error('ETIMEDOUT') }])(
    'rejects failed or timed-out CLI execution without emitting its output',
    async (failure) => {
      vi.spyOn(process, 'chdir').mockImplementation(() => {});
      vi.spyOn(process, 'stdin', 'get').mockReturnValue(
        Readable.from([
          JSON.stringify({
            base,
            branch: 'automation/issue-123-10-1',
            prompt: 'Implement locally',
            env: {},
          }),
        ]),
      );
      spawnSync.mockReturnValue({ ...failure, stdout: 'sensitive failure output' });
      await expect(remoteMain()).rejects.toThrow('Copilot failed or timed out');
    },
  );
});

describe('workflow cleanup', () => {
  it.each([
    ['happy', 0, 1],
    ['transient-api', 0, 2],
    ['stop-timeout', 0, 1],
    ['never-stopped', 1, 3],
  ])('stops only the recorded Codespace: %s', async (scenario, status, attempts) => {
    const fs = await vi.importActual('node:fs');
    const { spawnSync: spawn } = await vi.importActual('node:child_process');
    const workflow = fs.readFileSync('.github/workflows/codespaces-issue-agent.yml', 'utf8');
    const step = workflow
      .split('- name: Stop this Codespace even after failure')[1]
      .split('\n      -')[0];
    expect(step).toContain("always() && steps.codespace.outputs.name != ''");
    const script = step
      .split('run: |\n')[1]
      .split('\n')
      .map((line) => line.replace(/^ {10}/, ''))
      .join('\n');
    // Run the actual embedded Bash with fake CLI/time functions: no network, sleeping or resources.
    const stubs = `
  stop_count=0
  timeout() { shift; "$@"; }
  sleep() { :; }
  gh() {
    if [[ "$*" == 'codespace stop --codespace owned-only' ]]; then
      stop_count=$((stop_count + 1))
      echo "STOP owned-only"
      [[ "$SCENARIO" != stop-timeout ]]
    elif [[ "$*" == 'api /user/codespaces/owned-only --jq .state' ]]; then
      if [[ "$SCENARIO" == transient-api && "$stop_count" == 1 ]]; then return 1; fi
      if [[ "$SCENARIO" == never-stopped ]]; then echo Available; else echo Shutdown; fi
    else
      echo "Unexpected CLI invocation" >&2
      return 99
    fi
  }
  `;
    const execution = spawn('bash', ['-s'], {
      input: stubs + script,
      encoding: 'utf8',
      env: {
        PATH: process.env.PATH,
        SCENARIO: scenario,
        CODESPACE_NAME: 'owned-only',
        GITHUB_STEP_SUMMARY: '/dev/null',
      },
    });
    expect(execution.status, execution.stderr).toBe(status);
    expect(execution.stdout.match(/STOP owned-only/g)).toHaveLength(attempts);
    if (status !== 0) expect(execution.stdout).toContain('Owner must check the recorded Codespace');
  });
});

describe('deterministic publication', () => {
  it('rejects traversal, hidden configuration, instructions, symlinks and submodules', () => {
    for (const path of [
      '.github/workflows/a.yml',
      'packages/../README.md',
      'packages/a/.env',
      'packages/a/AGENTS.md',
      'packages/a\\b',
      'packages/a\nb',
    ]) {
      expect(() => checkPath(path, '100644')).toThrow();
    }
    for (const mode of ['120000', '160000']) {
      expect(() => checkPath('packages/a', mode)).toThrow();
    }
    expect(() => checkPath('.changeset/example.md', '100644')).not.toThrow();
  });

  it('applies only to the index and atomically creates a new ref and draft', async () => {
    await runWorkflow('publish');
    const calls = execFileSync.mock.calls;
    expect(
      calls
        .filter(([, args]) => args.includes('apply'))
        .every(([, args]) => args.includes('--cached')),
    ).toBe(true);
    const writes = calls.filter(([command, args]) => command === 'gh' && args.includes('POST'));
    const ref = writes.find(([, args]) => args[1].endsWith('/git/refs'));
    expect(JSON.parse(ref[2].input).ref).toBe('refs/heads/automation/issue-123-10-1');
    const pr = JSON.parse(writes.find(([, args]) => args[1].endsWith('/pulls'))[2].input);
    expect(pr.draft).toBe(true);
    expect(pr.body).toContain('not independently verified');
    expect(pr.body).not.toContain('[x]');
    expect(appendFileSync).toHaveBeenCalled();
  });

  it('fails without GitHub writes for a stale base or disallowed patch', async () => {
    execFileSync.mockReturnValue('b'.repeat(40));
    await expect(runWorkflow('publish')).rejects.toThrow('Approved base changed');
    execFileSync.mockImplementation((command, args) => {
      if (command === 'gh') return JSON.stringify({ sha: base });
      if (args.includes('rev-parse')) return base;
      if (args.includes('--name-only')) return '.github/workflows/attack.yml\0';
      return '';
    });
    await expect(runWorkflow('publish')).rejects.toThrow('disallowed path');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('POST'))).toBe(false);
  });

  it('rejects missing PR sections before applying a patch or writing to GitHub', async () => {
    readFileSync.mockImplementation((path) =>
      path.endsWith('result.json') ? JSON.stringify({ ...result, report: 'Incomplete' }) : report,
    );
    await expect(runWorkflow('publish')).rejects.toThrow('Incomplete PR template');
    expect(
      execFileSync.mock.calls.some(([, args]) => args.includes('apply') || args.includes('POST')),
    ).toBe(false);
  });

  it('rejects a failed patch check without publishing', async () => {
    const original = execFileSync.getMockImplementation();
    execFileSync.mockImplementation((command, args, options) => {
      if (args.includes('apply')) throw new Error('invalid patch');
      return original(command, args, options);
    });
    await expect(runWorkflow('publish')).rejects.toThrow('withheld');
    expect(execFileSync.mock.calls.some(([, args]) => args.includes('POST'))).toBe(false);
  });

  it('preserves rename deletions, spaces and binary content using a real local Git index', async () => {
    const fs = await vi.importActual('node:fs');
    const { execFileSync: exec } = await vi.importActual('node:child_process');
    const directory = fs.mkdtempSync(join(tmpdir(), 'codespaces-publish-test-'));
    /**
     * Confine real Git operations to a disposable fixture; all GitHub calls stay mocked.
     * @param args - Git arguments for fixture setup.
     * @returns Textual Git output.
     */
    const localGit = (...args) =>
      exec('git', ['-c', 'core.hooksPath=/dev/null', ...args], {
        cwd: directory,
        encoding: 'utf8',
        stdio: ['ignore', 'pipe', 'pipe'],
      });
    try {
      localGit('init');
      fs.mkdirSync(join(directory, 'packages/example'), { recursive: true });
      fs.writeFileSync(join(directory, 'packages/example/old.txt'), 'rename this content\n');
      fs.writeFileSync(join(directory, 'packages/example/deleted.txt'), 'remove me\n');
      localGit('add', '-A');
      localGit(
        '-c',
        'user.name=Test',
        '-c',
        'user.email=test@example.invalid',
        'commit',
        '--no-gpg-sign',
        '-m',
        'test fixture',
      );
      const fixtureBase = localGit('rev-parse', 'HEAD').trim();
      localGit('mv', 'packages/example/old.txt', 'packages/example/new name.txt');
      fs.unlinkSync(join(directory, 'packages/example/deleted.txt'));
      const binary = Buffer.from([0, 255, 1, 2, 3]);
      fs.writeFileSync(join(directory, 'packages/example/binary.dat'), binary);
      localGit('add', '-A');
      const patch = localGit('diff', '--cached', '--binary', fixtureBase);
      localGit('read-tree', 'HEAD');
      vi.stubEnv('BASE_SHA', fixtureBase);
      readFileSync.mockImplementation((path) =>
        path.endsWith('result.json') ? JSON.stringify({ ...result, patch }) : report,
      );
      const original = execFileSync.getMockImplementation();
      execFileSync.mockImplementation((command, args, options) => {
        if (command === 'git') return exec(command, args, { ...options, cwd: directory });
        if (args[1].endsWith('/commits/main')) return JSON.stringify({ sha: fixtureBase });
        return original(command, args, options);
      });
      await runWorkflow('publish');
      const posts = execFileSync.mock.calls.filter(([, args]) => args.includes('POST'));
      const tree = JSON.parse(
        posts.find(([, args]) => args[1].endsWith('/git/trees'))[2].input,
      ).tree;
      expect(tree.filter((file) => file.sha === null).map((file) => file.path)).toEqual([
        'packages/example/deleted.txt',
        'packages/example/old.txt',
      ]);
      expect(tree.some((file) => file.path === 'packages/example/new name.txt' && file.sha)).toBe(
        true,
      );
      const blobs = posts.filter(([, args]) => args[1].endsWith('/git/blobs'));
      expect(blobs.map(([, , options]) => JSON.parse(options.input).content)).toContain(
        binary.toString('base64'),
      );
      expect(localGit('diff', '--cached', '--binary', fixtureBase)).toBe(patch);
    } finally {
      fs.rmSync(directory, { recursive: true, force: true });
    }
  });
});
