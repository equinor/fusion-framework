import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the accessibility snapshot tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for capturing the current page snapshot
 */
export function createSnapshotTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_snapshot', {
    description:
      'Capture an accessibility snapshot of the current page. Returns a text representation of all visible elements with ref identifiers (e.g. @e1, @e2) that can be used in other commands.',
    parameters: {
      type: 'object' as const,
      properties: {},
    },
    handler: async () => {
      const output = context.invoke(['snapshot', '-ci']);
      writeFileSync(join(context.outDir, 'snapshot.txt'), output, 'utf-8');
      return output;
    },
  });
}