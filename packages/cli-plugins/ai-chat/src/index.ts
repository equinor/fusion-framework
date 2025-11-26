import type { Command } from 'commander';
import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as chatCommand } from './chat.js';

/**
 * Registers the AI chat plugin command with the CLI program
 * @param program - The Commander program instance to register commands with
 */
export function registerChatPlugin(program: Command): void {
  registerAiPlugin(program, chatCommand);
}

export default registerChatPlugin;
