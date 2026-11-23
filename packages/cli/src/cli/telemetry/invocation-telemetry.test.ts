import { EventEmitter } from 'node:events';
import { existsSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';

import { Command } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  getInvocationTraceContext,
  readTelemetrySettings,
  resolveTelemetryConfigPath,
  writeTelemetrySettings,
} from '@equinor/fusion-framework-cli/bin';

import type { InvocationExportResult, InvocationRecord } from './export-invocation.js';
import {
  startInvocationTelemetry,
  type StartInvocationTelemetryOptions,
  type TelemetryProcess,
} from './start-invocation-telemetry.js';
import { TELEMETRY_NOTICE } from './static.js';

type FakeProcess = EventEmitter & {
  argv: string[];
  env: NodeJS.ProcessEnv;
  pid: number;
  platform: string;
  arch: string;
  versions: { node: string };
  exitCode?: number;
  stderr: { isTTY: boolean; output: string; write(chunk: string): boolean };
  kill: ReturnType<typeof vi.fn>;
  exit: ReturnType<typeof vi.fn>;
};

let configHome: string;

const createProcess = (args: string[], env: NodeJS.ProcessEnv = {}): FakeProcess => {
  // Use real listener ordering with fake exit and signal operations.
  return Object.assign(new EventEmitter(), {
    argv: ['node', 'fusion-framework-cli', ...args],
    env: { XDG_CONFIG_HOME: configHome, ...env },
    pid: 4242,
    platform: 'linux',
    arch: 'x64',
    versions: { node: '24.0.0' },
    stderr: {
      isTTY: true,
      output: '',
      write(chunk: string): boolean {
        this.output += chunk;
        return true;
      },
    },
    kill: vi.fn(),
    exit: vi.fn(),
  });
};

const createProgram = (): Command => {
  const program = new Command('fusion-framework-cli').exitOverride();
  program
    .command('app')
    .command('build')
    .option('--env <env>')
    .option('--token <token>')
    .action(() => undefined);
  program
    .command('ai')
    .command('chat')
    .option('--env <env>')
    .action(() => undefined);
  program
    .command('telemetry')
    .command('disable')
    .action(() => undefined);
  return program;
};

/** Lets the asynchronous finalisation run. */
const settle = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const start = (
  proc: FakeProcess,
  overrides: Partial<StartInvocationTelemetryOptions> = {},
): {
  telemetry: ReturnType<typeof startInvocationTelemetry>;
  exportInvocation: ReturnType<typeof vi.fn>;
  program: Command;
} => {
  const exportInvocation = vi.fn(async (): Promise<InvocationExportResult> => 'settled');
  const program = overrides.program ?? createProgram();
  let time = 1_000;
  // The fixture implements the exercised process surface, not every Node overload.
  const process = proc as unknown as TelemetryProcess;
  const telemetry = startInvocationTelemetry({
    program,
    version: '1.2.3',
    process,
    ci: false,
    exportInvocation,
    now: () => (time += 500),
    machineId: () => 'machine-hash',
    ...overrides,
  });
  return { telemetry, exportInvocation, program };
};

const exported = (mock: ReturnType<typeof vi.fn>): InvocationRecord[] =>
  mock.mock.calls
    // Ignore exporter options when asserting the payload sent by the CLI.
    .map(([record]) => record as InvocationRecord);

beforeEach(() => {
  configHome = mkdtempSync(join(tmpdir(), 'ffc-telemetry-'));
});

afterEach(() => {
  rmSync(configHome, { recursive: true, force: true });
});

describe('startInvocationTelemetry', () => {
  it('exports exactly one safe invocation when the run drains successfully', async () => {
    const proc = createProcess(['app', 'build', '--env', 'fprd', '--token', 'secret-token']);
    const { telemetry, exportInvocation, program } = start(proc);
    expect(getInvocationTraceContext()?.traceId).toBe(telemetry?.traceId);

    await program.parseAsync(proc.argv);
    proc.emit('beforeExit');
    proc.emit('beforeExit');
    await settle();

    expect(exportInvocation).toHaveBeenCalledTimes(1);
    const [record] = exported(exportInvocation);
    expect(record).toEqual({
      traceId: telemetry?.traceId,
      spanId: expect.stringMatching(/^[0-9a-f]{16}$/),
      version: '1.2.3',
      command: 'app build',
      commandKind: 'builtin',
      optionNames: ['--env', '--token'],
      exitCode: 0,
      outcome: 'success',
      startTime: 1_500,
      endTime: 2_000,
      os: 'linux',
      arch: 'x64',
      nodeVersion: '24.0.0',
      ci: false,
      fusionEnvironment: 'fprd',
      machineId: 'machine-hash',
    });
    expect(JSON.stringify(record)).not.toContain('secret-token');
    expect(getInvocationTraceContext()).toBeUndefined();
  });

  it('records plugin failures from the exit code', async () => {
    const proc = createProcess(['ai', 'chat', '--env', 'not-an-env']);
    const { exportInvocation, program } = start(proc);

    await program.parseAsync(proc.argv);
    proc.exitCode = 2;
    proc.emit('beforeExit');
    await settle();

    expect(exported(exportInvocation)[0]).toMatchObject({
      command: 'ai chat',
      commandKind: 'plugin',
      exitCode: 2,
      outcome: 'failure',
    });
    expect(exported(exportInvocation)[0].fusionEnvironment).toBeUndefined();
  });

  it('lets Node.js exit on its own once the export settled, after command shutdown work', async () => {
    const proc = createProcess(['ai', 'chat']);
    const { exportInvocation, program } = start(proc);

    await program.parseAsync(proc.argv);
    proc.emit('beforeExit');
    // Shutdown work a plugin scheduled from `beforeExit` decides the final exit code.
    proc.exitCode = 7;
    await settle();
    await settle();

    expect(exportInvocation).toHaveBeenCalledOnce();
    expect(proc.exit).not.toHaveBeenCalled();
  });

  it('ends the process only when exporter work outlived the time bound', async () => {
    const proc = createProcess(['ai', 'chat']);
    const exportInvocation = vi.fn(async (): Promise<InvocationExportResult> => 'timedOut');
    const { program } = start(proc, { exportInvocation });

    await program.parseAsync(proc.argv);
    proc.emit('beforeExit');
    proc.exitCode = 7;
    await settle();
    await settle();

    expect(exportInvocation).toHaveBeenCalledOnce();
    // Uses the exit code the command left, not the one seen when the event loop first drained.
    expect(proc.exit).toHaveBeenCalledExactlyOnceWith(7);
  });

  it('records runs that Commander ends itself, keeping their exit code', async () => {
    const proc = createProcess(['nope-command']);
    const { telemetry, exportInvocation, program } = start(proc);

    const error = await program.parseAsync(proc.argv).catch((reason: unknown) => reason);
    await telemetry?.exit(1, error);
    proc.emit('beforeExit');
    await settle();

    expect(exportInvocation).toHaveBeenCalledTimes(1);
    expect(exported(exportInvocation)[0]).toMatchObject({
      command: '',
      exitCode: 1,
      outcome: 'failure',
      exceptionType: 'CommanderError',
    });
    expect(JSON.stringify(exported(exportInvocation)[0])).not.toContain('nope-command');
    // The caller owns the exit for Commander-ended runs.
    expect(proc.exit).not.toHaveBeenCalled();
  });

  it('records the type of an escaped error once, without its message', async () => {
    const proc = createProcess(['ai', 'chat']);
    const { telemetry, exportInvocation } = start(proc);

    await telemetry?.fail(new RangeError('token=abc'));
    proc.emit('beforeExit');
    await settle();

    expect(exportInvocation).toHaveBeenCalledTimes(1);
    expect(exported(exportInvocation)[0]).toMatchObject({
      exitCode: 1,
      outcome: 'failure',
      exceptionType: 'RangeError',
    });
    expect(JSON.stringify(exported(exportInvocation))).not.toContain('token=abc');
  });

  it('keeps the exception type seen by the uncaught exception monitor', async () => {
    const proc = createProcess(['app', 'build']);
    const { exportInvocation } = start(proc);

    proc.emit('uncaughtExceptionMonitor', new TypeError('boom'));
    proc.exitCode = 1;
    proc.emit('beforeExit');
    await settle();

    expect(exported(exportInvocation)[0].exceptionType).toBe('TypeError');
  });

  it('exports a fatal uncaught exception, prints it like Node.js and exits with code 1', async () => {
    const proc = createProcess(['app', 'build']);
    const { exportInvocation } = start(proc);
    const error = new TypeError('background boom');

    proc.emit('uncaughtExceptionMonitor', error);
    proc.emit('uncaughtException', error);
    await settle();

    expect(proc.stderr.output).toContain('TypeError: background boom');
    expect(proc.exit).toHaveBeenCalledExactlyOnceWith(1);
    const [record] = exported(exportInvocation);
    expect(record).toMatchObject({ exitCode: 1, outcome: 'failure', exceptionType: 'TypeError' });
    expect(JSON.stringify(record)).not.toContain('background boom');

    // A second fatal error while exporting exits at once without another record.
    proc.emit('uncaughtException', new Error('again'));
    expect(proc.exit).toHaveBeenCalledTimes(2);
    expect(exportInvocation).toHaveBeenCalledOnce();
  });

  it('leaves uncaught exceptions to a handler the command installed', async () => {
    const proc = createProcess(['app', 'build']);
    const { exportInvocation } = start(proc);
    proc.on('uncaughtException', () => undefined);

    proc.emit('uncaughtException', new Error('handled'));
    await settle();

    expect(proc.exit).not.toHaveBeenCalled();
    expect(proc.stderr.output).not.toContain('handled');
    expect(exportInvocation).not.toHaveBeenCalled();
  });

  it('leaves uncaught exceptions to a once handler the command installed', async () => {
    const proc = createProcess(['app', 'build']);
    const handler = vi.fn();
    // Installed before telemetry starts, so it would run (and remove itself) first.
    proc.once('uncaughtException', handler);
    const { exportInvocation } = start(proc);

    proc.emit('uncaughtException', new Error('handled'));
    await settle();

    expect(handler).toHaveBeenCalledOnce();
    expect(proc.exit).not.toHaveBeenCalled();
    expect(exportInvocation).not.toHaveBeenCalled();
  });

  it('exports a cancelled run on SIGINT, then re-raises the signal', async () => {
    const proc = createProcess(['app', 'build']);
    const { exportInvocation } = start(proc);

    proc.emit('SIGINT');
    await settle();

    expect(exported(exportInvocation)[0]).toMatchObject({ exitCode: 130, outcome: 'cancelled' });
    expect(proc.kill).toHaveBeenCalledWith(4242, 'SIGINT');
    expect(proc.listenerCount('SIGTERM')).toBe(0);
  });

  it('leaves signals owned by the command alone and marks the run cancelled', async () => {
    const proc = createProcess(['app', 'build']);
    const { exportInvocation } = start(proc);
    proc.on('SIGTERM', () => undefined);

    proc.emit('SIGTERM');
    await settle();
    expect(exportInvocation).not.toHaveBeenCalled();
    expect(proc.kill).not.toHaveBeenCalled();

    proc.emit('beforeExit');
    await settle();
    expect(exported(exportInvocation)[0]).toMatchObject({ exitCode: 0, outcome: 'cancelled' });
  });

  it('leaves signals owned by a once handler alone', async () => {
    const proc = createProcess(['app', 'build']);
    const handler = vi.fn();
    // Installed before telemetry starts, so it would run (and remove itself) first.
    proc.once('SIGINT', handler);
    const { exportInvocation } = start(proc);

    proc.emit('SIGINT');
    await settle();

    expect(handler).toHaveBeenCalledOnce();
    expect(proc.kill).not.toHaveBeenCalled();
    expect(exportInvocation).not.toHaveBeenCalled();
  });

  it('keeps the command outcome when collecting the machine id throws', async () => {
    const machineId = (): string => {
      throw new Error('no network interfaces');
    };
    const proc = createProcess(['app', 'build']);
    const { telemetry, exportInvocation } = start(proc, { machineId });
    await expect(telemetry?.fail(new Error('command failed'))).resolves.toBeUndefined();
    expect(exportInvocation).not.toHaveBeenCalled();

    const exiting = createProcess(['app', 'build']);
    start(exiting, { machineId });
    exiting.emit('beforeExit');
    await settle();
    expect(exiting.exit).not.toHaveBeenCalled();
  });

  it('never lets an export failure escape', async () => {
    const proc = createProcess(['app', 'build']);
    const { telemetry } = start(proc, {
      exportInvocation: vi.fn(async () => {
        throw new Error('unreachable');
      }),
    });

    await expect(telemetry?.fail(new Error('command failed'))).resolves.toBeUndefined();
  });

  it.each([
    ['FUSION_CLI_TELEMETRY_OPTOUT=1', { FUSION_CLI_TELEMETRY_OPTOUT: '1' }],
    ['FUSION_CLI_TELEMETRY_OPTOUT=true', { FUSION_CLI_TELEMETRY_OPTOUT: 'TRUE' }],
    ['DO_NOT_TRACK=1', { DO_NOT_TRACK: '1' }],
  ])('does nothing when opted out with %s', async (_, env) => {
    const proc = createProcess(['app', 'build'], env);
    const { telemetry, exportInvocation } = start(proc);

    proc.emit('beforeExit');
    await settle();

    expect(telemetry).toBeUndefined();
    expect(exportInvocation).not.toHaveBeenCalled();
    expect(getInvocationTraceContext()).toBeUndefined();
    expect(proc.stderr.output).toBe('');
    expect(proc.listenerCount('SIGINT')).toBe(0);
  });

  it('does nothing when disabled in the user config', () => {
    const proc = createProcess(['app', 'build']);
    writeTelemetrySettings(resolveTelemetryConfigPath(proc.env), { enabled: false });

    expect(start(proc).telemetry).toBeUndefined();
    expect(proc.stderr.output).toBe('');
  });

  it('does not record a run that disables telemetry', async () => {
    const proc = createProcess(['telemetry', 'disable']);
    const { exportInvocation } = start(proc);

    writeTelemetrySettings(resolveTelemetryConfigPath(proc.env), { enabled: false });
    proc.emit('beforeExit');
    await settle();

    expect(exportInvocation).not.toHaveBeenCalled();
    expect(proc.stderr.output).toBe('');
  });

  it('shows the notice once on stderr in interactive sessions', () => {
    const first = createProcess(['app', 'build']);
    start(first);
    const second = createProcess(['app', 'build']);
    start(second);

    expect(first.stderr.output).toBe(TELEMETRY_NOTICE);
    expect(TELEMETRY_NOTICE).toContain('FUSION_CLI_TELEMETRY_OPTOUT=1');
    expect(second.stderr.output).toBe('');
    expect(readTelemetrySettings(resolveTelemetryConfigPath(first.env)).noticeShown).toBe(true);
  });

  it('never rewrites the opt-out when recording the notice', () => {
    const first = createProcess(['app', 'build']);
    const configPath = resolveTelemetryConfigPath(first.env);
    // `telemetry disable` from another shell lands while the first run shows its notice.
    first.stderr.write = (chunk: string): boolean => {
      writeTelemetrySettings(configPath, { enabled: false });
      first.stderr.output += chunk;
      return true;
    };
    start(first);

    expect(first.stderr.output).toBe(TELEMETRY_NOTICE);
    expect(readTelemetrySettings(configPath)).toEqual({ enabled: false, noticeShown: true });
    // Only `telemetry enable|disable` writes the settings file; the notice uses its own marker.
    rmSync(configPath);
    start(createProcess(['app', 'build']));
    expect(existsSync(configPath)).toBe(false);
  });

  it('replaces the settings file atomically without leaving temporary files', () => {
    const configPath = resolveTelemetryConfigPath(createProcess([]).env);
    writeTelemetrySettings(configPath, { enabled: false });
    writeTelemetrySettings(configPath, { enabled: true });

    expect(readTelemetrySettings(configPath)).toEqual({ enabled: true });
    expect(readdirSync(dirname(configPath))).toEqual(['telemetry.json']);
  });

  it('suppresses the notice in CI and non-interactive sessions without persisting it', () => {
    const ci = createProcess(['app', 'build']);
    start(ci, { ci: true });
    const piped = createProcess(['app', 'build']);
    piped.stderr.isTTY = false;
    start(piped);

    expect(ci.stderr.output).toBe('');
    expect(piped.stderr.output).toBe('');
    expect(readTelemetrySettings(resolveTelemetryConfigPath(ci.env)).noticeShown).toBeUndefined();
  });
});
