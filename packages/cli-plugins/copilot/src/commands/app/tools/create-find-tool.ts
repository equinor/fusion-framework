import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the semantic locator tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for semantic element lookup and optional action execution
 */
export function createFindTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_find', {
    description:
      'Find an element using semantic locators (role, text, label) and optionally perform an action on it.',
    parameters: {
      type: 'object' as const,
      properties: {
        by: {
          type: 'string',
          description: 'Locator type: "role", "text", or "label"',
        },
        value: {
          type: 'string',
          description: 'Value to search for (role name, text content, or label)',
        },
        action: {
          type: 'string',
          description: 'Action to perform: "click" or "fill"',
        },
        name: { type: 'string', description: 'Accessible name filter (for role locators)' },
        fillValue: { type: 'string', description: 'Text to fill (when action is "fill")' },
      },
      required: ['by', 'value'],
    },
    handler: async (args) => {
      const { by, value, action, name, fillValue } = args as {
        by: string;
        value: string;
        action?: string;
        name?: string;
        fillValue?: string;
      };
      const command = ['find', by, value];
      // Append optional refinements only when the caller actually provided them
      if (action) command.push(action);
      // Attach the accessible-name filter when the caller supplied one
      if (name) command.push('--name', name);
      // Attach the fill value when the action is 'fill'
      if (fillValue) command.push(fillValue);
      return context.invoke(command);
    },
  });
}
