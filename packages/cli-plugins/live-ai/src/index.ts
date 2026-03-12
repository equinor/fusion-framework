import type { Command } from 'commander';
import liveAiCommand from './command.js';

/**
 * Registers the live-ai plugin command group with Fusion CLI.
 *
 * @param program - Commander program instance from the host CLI.
 */
export function registerLiveAiPlugin(program: Command): void {
  program.addCommand(liveAiCommand);
}

export default registerLiveAiPlugin;
