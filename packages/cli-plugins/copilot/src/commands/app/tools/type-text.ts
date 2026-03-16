import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the text typing tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for typing text into the focused element or a target
 */
export function createTypeTextTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_type', {
    description:
      'Type text character by character (useful for inputs that respond to keystrokes).',
    parameters: {
      type: 'object' as const,
      properties: {
        target: {
          type: 'string',
          description: 'Element ref or CSS selector (omit to type into focused element)',
        },
        text: { type: 'string', description: 'Text to type' },
      },
      required: ['text'],
    },
    handler: async (args) => {
      const { target, text } = args as { target?: string; text: string };
      const command = target ? ['type', target, text] : ['keyboard', 'type', text];
      return context.runAb(command);
    },
  });
}