import type { Command } from 'commander';
import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as embeddingsCommand } from './command.js';

/**
 * Registers the AI chat plugin command with the CLI program
 * @param program - The Commander program instance to register commands with
 */
export function registerChatPlugin(program: Command): void {
  registerAiPlugin(program, embeddingsCommand);
}

export default registerChatPlugin;

// Re-export config utilities for convenience
export {
  configureFusionAI,
  type FusionAIConfig,
} from '@equinor/fusion-framework-cli-plugin-ai-base';
