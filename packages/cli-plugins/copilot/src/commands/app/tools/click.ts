import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the click interaction tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for clicking a page element
 */
export function createClickTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_click', {
    description: 'Click an element identified by a ref (@e1), CSS selector, or text selector.',
    parameters: {
      type: 'object' as const,
      properties: {
        target: {
          type: 'string',
          description: 'Element ref (e.g. @e3), CSS selector, or text selector',
        },
      },
      required: ['target'],
    },
    handler: async (args) => {
      const { target } = args as { target: string };
      return context.invoke(['click', target]);
    },
  });
}
