import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as embeddingsCommand } from './command.js';
import { deleteCommand } from './delete-command.js';

export { FusionAIConfigWithIndex, IndexConfig } from './config.js';

/**
 * Registers the AI index plugin commands with the CLI program.
 *
 * Adds the following subcommands under `ai`:
 * - `ai embeddings` — index documents into the vector store
 * - `ai delete`     — remove documents from the vector store
 *
 * @param program - The Commander program instance to register commands with
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, embeddingsCommand);
  registerAiPluginBase(program, deleteCommand);
}

export default registerAiPlugin;

// Re-export config utilities for convenience
export {
  configureFusionAI,
  type FusionAIConfig,
} from '@equinor/fusion-framework-cli-plugin-ai-base';
