import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as embeddingsCommand } from './command.js';

export { FusionAIConfigWithIndex, IndexConfig } from './config.js';

/**
 * Registers the AI index plugin command with the CLI program
 * @param program - The Commander program instance to register commands with
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, embeddingsCommand);
}

export default registerAiPlugin;

// Re-export config utilities for convenience
export {
  configureFusionAI,
  type FusionAIConfig,
} from '@equinor/fusion-framework-cli-plugin-ai-base';
