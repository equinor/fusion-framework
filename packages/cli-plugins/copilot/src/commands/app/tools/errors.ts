import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the browser error collection tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for retrieving JavaScript errors
 */
export function createErrorsTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_errors', {
    description: 'Get all JavaScript console errors from the browser.',
    parameters: {
      type: 'object' as const,
      properties: {},
    },
    handler: async () => {
      const output = context.runAb(['errors']);
      writeFileSync(join(context.evidenceDir, 'errors.txt'), output, 'utf-8');
      return output || 'No errors';
    },
  });
}