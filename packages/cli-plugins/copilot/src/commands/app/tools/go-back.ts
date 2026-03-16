import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the back navigation tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for going back in browser history
 */
export function createGoBackTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_go_back', {
    description: 'Navigate back in browser history.',
    parameters: { type: 'object' as const, properties: {} },
    handler: async () => context.runAb(['back']),
  });
}