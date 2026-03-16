import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the hover interaction tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for hovering a page element
 */
export function createHoverTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_hover', {
    description: 'Hover over an element.',
    parameters: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Element ref or CSS selector' },
      },
      required: ['target'],
    },
    handler: async (args) => {
      const { target } = args as { target: string };
      return context.runAb(['hover', target]);
    },
  });
}