import { createClickTool } from './click.js';
import { createErrorsTool } from './errors.js';
import { createFillTool } from './fill.js';
import { createFindTool } from './find.js';
import { createGetUrlTool } from './get-url.js';
import { createGoBackTool } from './go-back.js';
import { createHoverTool } from './hover.js';
import { createNavigateTool } from './navigate.js';
import { createPressKeyTool } from './press-key.js';
import { createReloadTool } from './reload.js';
import { createEvalJsTool } from './eval-js.js';
import { createGetStylesTool } from './get-styles.js';
import { AgentBrowserToolRegistry } from './registry.js';
import { createScreenshotTool } from './screenshot.js';
import { createScrollTool } from './scroll.js';
import { createSelectTool } from './select.js';
import { createSnapshotTool } from './snapshot.js';
import { createTypeTextTool } from './type-text.js';
import type { AgentBrowserToolContext, AgentBrowserToolList, DefineTool } from './types.js';
import { createWaitTool } from './wait.js';

/**
 * Creates the full set of Copilot browser tools for an eval session.
 *
 * @param context - Shared execution context for all browser tool wrappers
 * @param defineTool - Copilot SDK helper used to declare tools
 * @returns Registered browser tools in the order they should be exposed to the model
 */
export function createAgentBrowserTools(
  context: AgentBrowserToolContext,
  defineTool: DefineTool,
): AgentBrowserToolList {
  const agentBrowser = new AgentBrowserToolRegistry();

  agentBrowser.addTools(
    createNavigateTool(context, defineTool),
    createSnapshotTool(context, defineTool),
    createScreenshotTool(context, defineTool),
    createGetStylesTool(context, defineTool),
    createEvalJsTool(context, defineTool),
    createClickTool(context, defineTool),
    createFillTool(context, defineTool),
    createTypeTextTool(context, defineTool),
    createPressKeyTool(context, defineTool),
    createHoverTool(context, defineTool),
    createSelectTool(context, defineTool),
    createScrollTool(context, defineTool),
    createWaitTool(context, defineTool),
    createFindTool(context, defineTool),
    createErrorsTool(context, defineTool),
    createGetUrlTool(context, defineTool),
    createGoBackTool(context, defineTool),
    createReloadTool(context, defineTool),
  );

  return agentBrowser.getTools();
}