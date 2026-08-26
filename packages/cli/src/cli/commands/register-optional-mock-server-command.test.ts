import { Command } from 'commander';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { registerOptionalMockServerCommand } from './register-optional-mock-server-command.js';

describe('registerOptionalMockServerCommand', () => {
  afterEach(() => {
    process.exitCode = undefined;
  });

  it('delegates to the plugin package when it is installed', async () => {
    const program = new Command();

    await registerOptionalMockServerCommand(
      program,
      '@equinor/fusion-framework-cli-plugin-mock-server',
    );

    // locate the command this call registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');
    // the real plugin registers its own --preset/--port/--host options; the stub registers none
    expect(mockServerCommand?.options.map((option) => option.long)).toEqual(
      expect.arrayContaining(['--preset', '--port', '--host']),
    );
  }, 15_000);

  it('registers a stub command when the plugin package is not installed', async () => {
    const program = new Command();

    await registerOptionalMockServerCommand(program, '@equinor/definitely-does-not-exist-xyz');

    // locate the command this call registered, by name
    const mockServerCommand = program.commands.find((command) => command.name() === 'mock-server');
    expect(mockServerCommand).toBeDefined();
    expect(mockServerCommand?.options).toHaveLength(0);
  });

  it('preserves a mock-server command registered by configured plugins', async () => {
    const program = new Command();
    const configuredCommand = new Command('mock-server').option('--custom-default <value>');
    program.addCommand(configuredCommand);

    await registerOptionalMockServerCommand(program);

    // Collect every same-name command to prove the fallback did not add a duplicate.
    const registeredCommands = program.commands.filter(
      (command) => command.name() === 'mock-server',
    );
    expect(registeredCommands).toEqual([configuredCommand]);
  });

  it('tells the user to install the missing package, when the stub command runs', async () => {
    const program = new Command();
    await registerOptionalMockServerCommand(program, '@equinor/definitely-does-not-exist-xyz');
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    await program.parseAsync(['mock-server'], { from: 'user' });

    expect(errorSpy).toHaveBeenCalledWith(
      expect.stringContaining('pnpm add -D @equinor/definitely-does-not-exist-xyz'),
    );
    expect(process.exitCode).toBe(1);
    errorSpy.mockRestore();
  });
});
