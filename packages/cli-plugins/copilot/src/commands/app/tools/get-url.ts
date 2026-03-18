import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the current URL inspection tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for retrieving the current page URL
 */
export function createGetUrlTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_get_url', {
    description: 'Get the current page URL.',
    parameters: {
      type: 'object' as const,
      properties: {},
    },
    handler: async () => {
      const output = context.invoke(['get', 'url']);
      writeFileSync(join(context.outDir, 'url.txt'), output, 'utf-8');
      return output;
    },
  });
}
