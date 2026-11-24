import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { Command, CommanderError } from 'commander';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { routeCommanderExits } from './route-commander-exits.js';
import type { InvocationTelemetry } from './start-invocation-telemetry.js';

let dir: string;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'ffc-commander-exit-'));
});

afterEach(() => {
  rmSync(dir, { recursive: true, force: true });
});

const createTelemetry = (): InvocationTelemetry & { exit: ReturnType<typeof vi.fn> } => ({
  traceId: '0'.repeat(32),
  fail: vi.fn(async () => undefined),
  exit: vi.fn(async () => undefined),
});

describe('routeCommanderExits', () => {
  it('records a standalone executable subcommand with its exit code, then exits with it', async () => {
    const executable = join(dir, 'plugin-cmd.mjs');
    writeFileSync(executable, 'process.exitCode = 7;\n');
    const program = new Command('fusion-framework-cli');
    program.command('plugin-cmd', 'standalone plugin', { executableFile: executable });
    const telemetry = createTelemetry();
    const exited = new Promise<number>((resolve) => {
      routeCommanderExits(program, { telemetry, exit: resolve });
    });

    await program.parseAsync(['node', 'fusion-framework-cli', 'plugin-cmd']);

    await expect(exited).resolves.toBe(7);
    expect(telemetry.exit).toHaveBeenCalledExactlyOnceWith(7);
  });

  it('throws Commander exits so they can be recorded, and recognises only those', async () => {
    const program = new Command('fusion-framework-cli');
    program.command('app').action(() => undefined);
    program.configureOutput({ writeErr: () => undefined });
    const telemetry = createTelemetry();
    const isCommanderExit = routeCommanderExits(program, { telemetry, exit: vi.fn() });

    const error = await program
      .parseAsync(['node', 'fusion-framework-cli', 'nope'])
      .catch((reason: unknown) => reason);

    expect(error).toBeInstanceOf(CommanderError);
    expect(isCommanderExit(error)).toBe(true);
    expect(isCommanderExit(new CommanderError(1, 'custom', 'thrown by a hook'))).toBe(false);
    expect(telemetry.exit).not.toHaveBeenCalled();
  });
});
