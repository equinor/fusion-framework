import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the JavaScript evaluation tool.
 *
 * Runs a JS expression in the browser's page context and returns the result.
 * Ideal for extracting computed values such as `getComputedStyle(document.body).backgroundColor`
 * that cannot be reliably inferred from screenshots.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for evaluating arbitrary JavaScript in the browser
 */
export function createEvalJsTool(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
) {
  return defineTool('browser_eval', {
    description:
      'Evaluate a JavaScript expression in the browser page context and return the result. Use for reading DOM values, computed styles, or element properties that need exact values (e.g. getComputedStyle(document.body).backgroundColor).',
    parameters: {
      type: 'object' as const,
      properties: {
        script: {
          type: 'string',
          description:
            'A single JavaScript expression to evaluate (e.g. "getComputedStyle(document.body).backgroundColor")',
        },
      },
      required: ['script'],
    },
    handler: async (args) => {
      const { script } = args as { script: string };
      const output = context.runAb(['eval', script, '--json']);
      const timestamp = Date.now();
      writeFileSync(join(context.evidenceDir, `eval-${timestamp}.json`), output, 'utf-8');
      return output;
    },
  });
}
