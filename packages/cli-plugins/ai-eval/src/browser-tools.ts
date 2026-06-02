import { tool } from '@langchain/core/tools';
import { z } from 'zod';
import { ab, abErrorMessage } from './utils/agent-browser.js';

/**
 * Creates the set of LangChain tool wrappers around the `agent-browser` CLI.
 *
 * Each tool is a typed {@link DynamicStructuredTool} that the Explorer model
 * can call via LangChain's tool-calling loop (`model.bindTools`). The tools
 * map 1-to-1 to `agent-browser` subcommands and are the only interface the
 * Explorer has with the running application.
 *
 * @returns Array of LangChain tools to pass to `model.bindTools(tools)`.
 *
 * @example
 * ```ts
 * const tools = createBrowserTools();
 * const bound = model.bindTools(tools);
 * ```
 */
export function createBrowserTools() {
  const browserNavigate = tool(
    async ({ url }) => {
      try {
        return ab(['open', url]);
      } catch (err) {
        return `Error navigating to ${url}: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_navigate',
      description:
        'Navigate the browser to a URL. Use this to open the application or move to a specific route.',
      schema: z.object({
        url: z.string().describe('The full URL to navigate to (e.g. http://localhost:3333/apps/my-app)'),
      }),
    },
  );

  const browserSnapshot = tool(
    async () => {
      try {
        return ab(['snapshot', '--ci']);
      } catch (err) {
        return `Error taking snapshot: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_snapshot',
      description:
        'Take an accessibility snapshot of the current page. Returns the full accessible DOM tree as text. Use this to read page content and find elements.',
      schema: z.object({}),
    },
  );

  const browserScreenshot = tool(
    async () => {
      try {
        return ab(['screenshot', '--screenshot-format', 'jpeg', '--screenshot-quality', '60']);
      } catch (err) {
        return `Error taking screenshot: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_screenshot',
      description:
        'Take a screenshot of the current page. Use this to capture visual evidence of the current application state.',
      schema: z.object({}),
    },
  );

  const browserClick = tool(
    async ({ target }) => {
      try {
        return ab(['click', target]);
      } catch (err) {
        return `Error clicking "${target}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_click',
      description:
        'Click an element on the page. The target can be a CSS selector, accessible name, or text content.',
      schema: z.object({
        target: z.string().describe('CSS selector, accessible name, or text of the element to click'),
      }),
    },
  );

  const browserFind = tool(
    async ({ by, value }) => {
      try {
        return ab(['find', by, value]);
      } catch (err) {
        return `Error finding element by ${by}="${value}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_find',
      description:
        'Find an element on the page by a specific attribute. Useful for locating elements by role, label, or text when the selector is unknown.',
      schema: z.object({
        by: z.enum(['role', 'label', 'text', 'selector']).describe('How to find the element'),
        value: z.string().describe('The value to search for'),
      }),
    },
  );

  const browserEvalJs = tool(
    async ({ expression }) => {
      try {
        return ab(['eval', expression, '--json']);
      } catch (err) {
        return `Error evaluating JS: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_eval_js',
      description:
        'Execute a JavaScript expression in the browser and return the result as JSON. Use this to read application state, local storage, or computed values.',
      schema: z.object({
        expression: z.string().describe('JavaScript expression to evaluate in the browser context'),
      }),
    },
  );

  const browserWait = tool(
    async ({ condition, value }) => {
      try {
        if (condition === 'ms') {
          return ab(['wait', String(value)]);
        }
        if (condition === 'text') {
          return ab(['wait', '--text', String(value)]);
        }
        if (condition === 'selector') {
          return ab(['wait', '--selector', String(value)]);
        }
        return ab(['wait', '--load']);
      } catch (err) {
        return `Error waiting: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_wait',
      description:
        'Wait for a condition before continuing. Use this after navigation or interactions to allow the page to settle.',
      schema: z.object({
        condition: z
          .enum(['load', 'text', 'selector', 'ms'])
          .describe('What to wait for: page load, specific text, element selector, or a fixed delay'),
        value: z
          .union([z.string(), z.number()])
          .optional()
          .describe('For "text" and "selector": the value to wait for. For "ms": milliseconds to wait.'),
      }),
    },
  );

  const browserFill = tool(
    async ({ target, value }) => {
      try {
        return ab(['fill', target, value]);
      } catch (err) {
        return `Error filling "${target}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_fill',
      description: 'Fill an input field with a value.',
      schema: z.object({
        target: z.string().describe('CSS selector or accessible name of the input field'),
        value: z.string().describe('Value to type into the field'),
      }),
    },
  );

  const browserGetUrl = tool(
    async () => {
      try {
        return ab(['get', 'url']);
      } catch (err) {
        return `Error getting URL: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_get_url',
      description: 'Get the current page URL. Use this to verify navigation succeeded.',
      schema: z.object({}),
    },
  );

  const browserErrors = tool(
    async () => {
      try {
        return ab(['errors']);
      } catch (err) {
        return `Error retrieving console errors: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_errors',
      description:
        'Get JavaScript console errors from the current page. Use this to check for runtime errors that might affect functionality.',
      schema: z.object({}),
    },
  );

  const browserConsole = tool(
    async ({ clear }) => {
      try {
        const args: string[] = ['console', '--json'];
        if (clear) args.push('--clear');
        return ab(args);
      } catch (err) {
        return `Error retrieving console logs: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_console',
      description:
        'Get all browser console output (log, warn, error, info) as JSON. ' +
        'Use this to check for errors, warnings, or diagnostic messages emitted by the application. ' +
        'Pass clear=true to flush the buffer after reading.',
      schema: z.object({
        clear: z.boolean().optional().describe('Clear the console buffer after reading (default false)'),
      }),
    },
  );

  const browserGoBack = tool(
    async () => {
      try {
        return ab(['back']);
      } catch (err) {
        return `Error going back: ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_go_back',
      description: 'Navigate back in browser history.',
      schema: z.object({}),
    },
  );

  const browserGetStyles = tool(
    async ({ selector }) => {
      try {
        return ab(['get', 'styles', selector]);
      } catch (err) {
        return `Error getting styles for "${selector}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_get_styles',
      description:
        'Get computed CSS styles for an element. Returns all computed style properties. Use this to verify background color, font, layout, or any visual property.',
      schema: z.object({
        selector: z.string().describe('CSS selector for the element (e.g. "div", "main", ".container", "h1")'),
      }),
    },
  );

  const browserGetText = tool(
    async ({ selector }) => {
      try {
        return ab(['get', 'text', selector]);
      } catch (err) {
        return `Error getting text for "${selector}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_get_text',
      description:
        'Get the visible text content of an element. More reliable than snapshot for verifying exact text.',
      schema: z.object({
        selector: z.string().describe('CSS selector for the element'),
      }),
    },
  );

  const browserIs = tool(
    async ({ state, selector }) => {
      try {
        return ab(['is', state, selector]);
      } catch (err) {
        return `Error checking state "${state}" for "${selector}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_is',
      description:
        'Check the state of an element: visible, enabled, or checked. Returns true/false.',
      schema: z.object({
        state: z.enum(['visible', 'enabled', 'checked']).describe('State to check'),
        selector: z.string().describe('CSS selector for the element'),
      }),
    },
  );

  const browserGetHtml = tool(
    async ({ selector }) => {
      try {
        return ab(['get', 'html', selector]);
      } catch (err) {
        return `Error getting HTML for "${selector}": ${abErrorMessage(err)}`;
      }
    },
    {
      name: 'browser_get_html',
      description:
        'Get the inner HTML of an element. Use this to inspect structure or attributes not visible in the accessibility snapshot.',
      schema: z.object({
        selector: z.string().describe('CSS selector for the element'),
      }),
    },
  );

  return [
    browserNavigate,
    browserSnapshot,
    browserScreenshot,
    browserClick,
    browserFind,
    browserEvalJs,
    browserWait,
    browserFill,
    browserGetUrl,
    browserErrors,
    browserConsole,
    browserGoBack,
    browserGetStyles,
    browserGetText,
    browserIs,
    browserGetHtml,
  ] as const;
}

/** Type of the browser tools array returned by {@link createBrowserTools}. */
export type BrowserTools = ReturnType<typeof createBrowserTools>;
