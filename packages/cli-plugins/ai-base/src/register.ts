import type { Command } from 'commander';
import { createCommand } from 'commander';

/**
 * Registers an AI plugin command with the CLI program.
 * Creates the 'ai' command group if it doesn't exist, then adds the provided command to it.
 *
 * @param program - The Commander program instance to register commands with
 * @param command - The command to add to the 'ai' command group
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
