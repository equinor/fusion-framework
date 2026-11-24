import type { Command, CommanderError } from 'commander';

import type { InvocationTelemetry } from './start-invocation-telemetry.js';

/** Options for {@link routeCommanderExits}. */
export interface RouteCommanderExitsOptions {
  /** Telemetry of the running invocation. */
  telemetry: InvocationTelemetry;
  /** Ends the process; defaults to `process.exit`. */
  exit?: (exitCode: number) => void;
}

/**
 * Makes Commander throw instead of calling `process.exit()` on every registered command, so help,
 * version and usage errors can be recorded before the CLI exits.
 *
 * A standalone executable subcommand ends asynchronously, after parsing has returned. Commander
 * would exit with that executable's code, so the invocation is recorded with that code and the
 * process then exits with it.
 *
 * @param program - Root command with all built-in and plugin commands registered.
 * @param options - Telemetry of the running invocation and an injectable exit.
 * @returns A guard for errors from Commander's own exit path, which Commander has already
 * printed. Hooks and actions may throw other `CommanderError`s (for example
 * `InvalidOptionArgumentError`) that nothing has printed.
 */
export const routeCommanderExits = (
  program: Command,
  options: RouteCommanderExitsOptions,
): ((error: unknown) => error is CommanderError) => {
  const { telemetry, exit = (exitCode: number) => process.exit(exitCode) } = options;
  const commanderExits = new WeakSet<object>();

  const override = (command: Command): void => {
    command.exitOverride((error) => {
      // A standalone executable exits outside the synchronous parser path.
      if (error.code === 'commander.executeSubCommandAsync') {
        void telemetry.exit(error.exitCode).finally(() => exit(error.exitCode));
        return;
      }
      commanderExits.add(error);
      throw error;
    });
    // Subcommands can end the process independently of the root command.
    for (const subcommand of command.commands) override(subcommand);
  };
  override(program);

  return (error: unknown): error is CommanderError =>
    typeof error === 'object' && error !== null && commanderExits.has(error);
};
