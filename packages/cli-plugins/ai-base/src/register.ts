import type { Command } from 'commander';
import { createCommand } from 'commander';

/**
 * Registers an AI plugin command with the CLI program.
 *
 * Ensures the `ai` command group exists and attaches the provided command
 * as a direct subcommand. Each plugin is responsible for structuring its
 * own subcommands internally.
 *
 * @param program - The Commander program instance to register commands with.
 * @param command - The command to add under the `ai` command group.
 *
 * @example
 * ```ts
 * // Register a command under `ai`:
 * registerAiPlugin(program, chatCommand);
 * // Results in: ffc ai chat
 *
 * // Register a command that has its own subcommands:
 * registerAiPlugin(program, indexCommand);
 * // Results in: ffc ai index embeddings, ffc ai index delete, etc.
 * ```
 */
export function registerAiPlugin(program: Command, command: Command): void {
  // Create 'ai' command group if it doesn't exist
  let aiCommand = program.commands.find((cmd) => cmd.name() === 'ai');
  if (!aiCommand) {
    aiCommand = createCommand('ai').description(
      'Commands for interacting with AI models and Azure OpenAI services',
    );
    program.addCommand(aiCommand);
  }

  aiCommand.addCommand(command);
}

export default registerAiPlugin;
