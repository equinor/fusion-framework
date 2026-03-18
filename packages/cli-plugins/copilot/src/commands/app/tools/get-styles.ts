import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the computed CSS styles inspection tool.
 *
 * Use this tool instead of (or alongside) screenshots to verify color and layout criteria.
 * It returns the actual browser-computed style values for a given selector, which cannot
 * be misread or hallucinated the way image data can.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for retrieving computed CSS style properties
 */
export function createGetStylesTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_get_styles', {
    description:
      'Get computed CSS styles of an element. Use this for verifying visual properties such as background-color, color, or font-size WITHOUT relying on screenshot interpretation. Returns the computed style object as plain text.',
    parameters: {
      type: 'object' as const,
      properties: {
        selector: {
          type: 'string',
          description:
            'Element ref (e.g. @e1), CSS selector, or tag name to inspect (e.g. "body", "main", "h1")',
        },
      },
      required: ['selector'],
    },
    handler: async (args) => {
      const { selector } = args as { selector: string };
      const output = context.invoke(['get', 'styles', selector]);
      const safeSelector = selector.replace(/[^a-z0-9]/gi, '_').slice(0, 40);
      writeFileSync(join(context.outDir, `styles-${safeSelector}.txt`), output, 'utf-8');
      return output;
    },
  });
}
