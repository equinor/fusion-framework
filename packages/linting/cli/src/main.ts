import { Command } from 'commander';
import { createLintCommand } from './commands/lint.js';
import { createChangedCommand } from './commands/changed.js';

/**
 * Run the standalone `fusion-lint` binary.
 *
 * The program exposes two commands:
 * - `lint` (default) — lint files, directories, or glob patterns
 * - `changed`        — lint only files changed in git
 *
 * The `lint` command is the default, so `fusion-lint packages/modules/http`
 * works without an explicit sub-command name.
 */
export async function main(): Promise<void> {
  const program = new Command('fusion-lint')
    .version('0.1.0')
    .description('Run Fusion lint rules on TypeScript source files');

  // lint is the default command — `fusion-lint packages/modules/http` routes here directly
  program.addCommand(createLintCommand(), { isDefault: true });
  program.addCommand(createChangedCommand());

  await program.parseAsync();
}
