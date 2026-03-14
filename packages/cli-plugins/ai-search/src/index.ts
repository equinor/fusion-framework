import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as searchCommand } from './search.js';

/**
 * Register the AI search plugin with the Fusion Framework CLI.
 *
 * Call this function to add the `ai search` subcommand to a Commander program.
 * The subcommand enables semantic vector-store search against Azure Cognitive
 * Search, supporting similarity and MMR search types, OData filters, and
 * multiple output formats.
 *
 * This is the main entry point consumed by the CLI plugin loader when
 * `@equinor/fusion-framework-cli-plugin-ai-search` is listed in the CLI
 * configuration.
 *
 * @param program - The root Commander {@link Command} instance to attach the
 *   `ai search` subcommand to.
 *
 * @example
 * ```ts
 * import { Command } from 'commander';
 * import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-search';
 *
 * const program = new Command();
 * registerAiPlugin(program);
 * program.parse();
 * ```
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, searchCommand);
}

export default registerAiPlugin;
