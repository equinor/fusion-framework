import type { Command } from 'commander';
import { registerAiPlugin as registerAiPluginBase } from '@equinor/fusion-framework-cli-plugin-ai-base';
import { command as mcpCommand } from './mcp.js';

/**
 * Registers the AI MCP server plugin command with the CLI program
 * @param program - The Commander program instance to register commands with
 */
export function registerAiPlugin(program: Command): void {
  registerAiPluginBase(program, mcpCommand);
}

export default registerAiPlugin;
