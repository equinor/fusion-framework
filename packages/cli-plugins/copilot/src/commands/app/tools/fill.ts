import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the form fill tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for filling input fields
 */
export function createFillTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_fill', {
    description: 'Fill a form field with text. Clears existing content first.',
    parameters: {
      type: 'object' as const,
      properties: {
        target: {
          type: 'string',
          description: 'Element ref or CSS selector for the input field',
        },
        value: { type: 'string', description: 'Text to fill into the field' },
      },
      required: ['target', 'value'],
    },
    handler: async (args) => {
      const { target, value } = args as { target: string; value: string };
      return context.runAb(['fill', target, value]);
    },
  });
}