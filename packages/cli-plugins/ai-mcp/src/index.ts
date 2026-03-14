import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as mcpCommand } from './mcp.js';

/**
 * Registers the AI MCP server plugin with the Fusion Framework CLI.
 *
 * Adds the `ai mcp` subcommand to the given Commander program so that
 * running `ffc ai mcp` starts a Model Context Protocol server.
 *
 * @param program - Root Commander {@link Command} instance provided by the CLI bootstrap
 *
 * @example
 * ```ts
 * import { registerAiPlugin } from '@equinor/fusion-framework-cli-plugin-ai-mcp';
 * registerAiPlugin(program);
 * ```
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, mcpCommand);
}

export default registerAiPlugin;
