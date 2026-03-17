import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the select interaction tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for choosing an option in a select element
 */
export function createSelectTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_select', {
    description: 'Select an option from a dropdown/select element.',
    parameters: {
      type: 'object' as const,
      properties: {
        target: { type: 'string', description: 'Element ref or CSS selector for the select' },
        value: { type: 'string', description: 'Value or label of the option to select' },
      },
      required: ['target', 'value'],
    },
    handler: async (args) => {
      const { target, value } = args as { target: string; value: string };
      return context.invoke(['select', target, value]);
    },
  });
}