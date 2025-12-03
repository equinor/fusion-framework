import type { Command } from 'commander';
import { createCommand } from 'commander';

/**
 * Registers an AI plugin command with the CLI program.
 *
 * This function ensures the 'ai' command group exists in the CLI program and adds
 * the provided command as a subcommand. If the 'ai' group doesn't exist, it creates
 * it with a standard description. This allows multiple AI-related plugins to register
 * their commands under a common namespace.
 *
 * @param program - The Commander program instance to register commands with
 * @param command - The command to add to the 'ai' command group
 * @returns void
 *
 * @example
 * ```ts
 * const myAiCommand = createCommand('chat')
 *   .description('Start an AI chat session')
 *   .action(() => { ... });
 *
 * registerAiPlugin(program, myAiCommand);
 * // Results in: fusion-cli ai chat
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
