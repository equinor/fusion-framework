import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the scroll tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for page scrolling or scrolling an element into view
 */
export function createScrollTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_scroll', {
    description: 'Scroll the page or scroll an element into view.',
    parameters: {
      type: 'object' as const,
      properties: {
        direction: {
          type: 'string',
          description: 'Scroll direction: "up" or "down"',
        },
        amount: {
          type: 'number',
          description: 'Pixels to scroll (default: one viewport height)',
        },
        target: {
          type: 'string',
          description: 'Element ref to scroll into view (overrides direction/amount)',
        },
      },
    },
    handler: async (args) => {
      const { direction, amount, target } = args as {
        direction?: string;
        amount?: number;
        target?: string;
      };
      if (target) {
        return context.invoke(['scrollintoview', target]);
      }
      const scrollDirection = direction ?? 'down';
      const command = ['scroll', scrollDirection];
      if (amount) command.push(String(amount));
      return context.invoke(command);
    },
  });
}
