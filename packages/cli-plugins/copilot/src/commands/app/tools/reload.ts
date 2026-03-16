import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the page reload tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for reloading the current page
 */
export function createReloadTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_reload', {
    description: 'Reload the current page.',
    parameters: { type: 'object' as const, properties: {} },
    handler: async () => context.runAb(['reload']),
  });
}