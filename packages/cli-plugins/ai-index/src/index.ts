import type { Command } from 'commander';
import { createCommand } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as addCommand } from './embeddings-command.js';
import { deleteCommand as removeCommand } from './delete-command.js';
import { searchCommand } from './search-command.js';
import { embedCommand } from './embed-command.js';

export { FusionAIConfigWithIndex, IndexConfig } from './config.js';

/**
 * Parent command for the `ai index` group.
 *
 * Owns three subcommands:
 * - `add`    — index documents into the Azure AI Search vector store.
 * - `remove` — remove documents from the vector store.
 * - `search` — query the vector store for indexed documents.
 */
const indexCommand = createCommand('index')
  .description('Manage the AI search index (add, search, remove)')
  .addCommand(addCommand)
  .addCommand(removeCommand)
  .addCommand(searchCommand)
  .addCommand(embedCommand);

/**
 * Registers the `ai index` command with the Fusion Framework CLI.
 *
 * Adds a single `index` command under `ai` with subcommands for indexing,
 * searching, and removing documents in the Azure AI Search vector store.
 *
 * @param program - The root Commander {@link Command} instance to attach to.
 *
 * @example
 * ```ts
 * import { Command } from 'commander';
 * import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-index';
 *
 * const program = new Command();
 * registerAiPlugin(program);
 * program.parse();
 * // ffc ai index add [glob-patterns...]
 * // ffc ai index search <query>
 * // ffc ai index remove [source-paths...]
 * ```
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, indexCommand);
}

export default registerAiPlugin;

// Re-export config utilities for convenience
export {
  configureFusionAI,
  type FusionAIConfig,
} from '@equinor/fusion-framework-cli-plugin-ai-base';
