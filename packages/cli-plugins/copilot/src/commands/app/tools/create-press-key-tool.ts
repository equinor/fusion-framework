import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the keyboard press tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for pressing a single key
 */
export function createPressKeyTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_press_key', {
    description: 'Press a keyboard key (Enter, Tab, Escape, ArrowDown, etc.).',
    parameters: {
      type: 'object' as const,
      properties: {
        key: { type: 'string', description: 'Key name (e.g. Enter, Tab, Escape)' },
      },
      required: ['key'],
    },
    handler: async (args) => {
      const { key } = args as { key: string };
      return context.invoke(['press', key]);
    },
  });
}
