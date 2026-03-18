import type { Command } from 'commander';
import { copilotCommand } from './commands/app/command.js';

/**
 * Registers the `copilot` CLI plugin with the Fusion Framework CLI.
 *
 * Attaches the top-level `copilot` command group, providing Copilot SDK
 * powered evaluation tools with agent-browser.
 *
 * Usage:
 *   ffc copilot app eval ./cookbooks/app-react
 *   ffc copilot app eval . --eval smoke --model claude-sonnet-4
 *
 * @param program - The root Commander program instance
 */
export function registerCopilotPlugin(program: Command): void {
  program.addCommand(copilotCommand);
}

export default registerCopilotPlugin;
