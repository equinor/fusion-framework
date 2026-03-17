import { clearMsalInteraction } from '../../../utils/index.js';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the browser navigation tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for opening a URL
 */
export function createNavigateTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_navigate', {
    description:
      'Navigate the browser to a URL. Use this to open the application or follow links.',
    parameters: {
      type: 'object' as const,
      properties: {
        url: { type: 'string', description: 'The URL to navigate to' },
      },
      required: ['url'],
    },
    handler: async (args) => {
      const { url } = args as { url: string };
      const result = context.invoke(['open', url], 120_000);
      clearMsalInteraction();
      return result || 'Navigation complete';
    },
  });
}