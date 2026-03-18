import type { AgentBrowserToolContext, DefineTool } from './types.js';

/**
 * Creates the wait tool.
 *
 * @param context - Shared browser tool execution context
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Copilot tool definition for waiting on load state, text, elements, or time
 */
export function createWaitTool(context: AgentBrowserToolContext, defineTool: DefineTool) {
  return defineTool('browser_wait', {
    description:
      'Wait for a condition: page load (networkidle), text to appear, an element, or a timeout in ms.',
    parameters: {
      type: 'object' as const,
      properties: {
        text: { type: 'string', description: 'Wait for this text to appear on the page' },
        selector: { type: 'string', description: 'Wait for this element ref or CSS selector' },
        load: {
          type: 'string',
          description: 'Wait for page load state: "networkidle", "domcontentloaded", or "load"',
        },
        timeout: { type: 'number', description: 'Wait for this many milliseconds' },
      },
    },
    handler: async (args) => {
      const { text, selector, load, timeout } = args as {
        text?: string;
        selector?: string;
        load?: string;
        timeout?: number;
      };
      if (text) return context.invoke(['wait', '--text', text], 60_000);
      if (load) return context.invoke(['wait', '--load', load], 60_000);
      if (selector) return context.invoke(['wait', selector], 60_000);
      if (timeout) {
        await new Promise((resolve) => setTimeout(resolve, timeout));
        return `Waited ${timeout}ms`;
      }
      return context.invoke(['wait', '--load', 'networkidle'], 60_000);
    },
  });
}
