import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as embeddingsCommand } from './command.js';
import { deleteCommand } from './delete-command.js';

export { FusionAIConfigWithIndex, IndexConfig } from './config.js';

/**
 * Registers the AI index plugin commands with the Fusion Framework CLI.
 *
 * Adds the following subcommands under the `ai` command group:
 * - `ai embeddings` — index documents into the Azure AI Search vector store.
 * - `ai delete`     — remove documents from the vector store.
 *
 * @param program - The root Commander {@link Command} instance to attach subcommands to.
 *
 * @example
 * ```ts
 * import { Command } from 'commander';
 * import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * const program = new Command();
 * registerAiPlugin(program);
 * program.parse();
 * ```
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
