import { createClickTool } from './create-click-tool.js';
import { createErrorsTool } from './create-errors-tool.js';
import { createFillTool } from './create-fill-tool.js';
import { createFindTool } from './create-find-tool.js';
import { createGetUrlTool } from './create-get-url-tool.js';
import { createGoBackTool } from './create-go-back-tool.js';
import { createHoverTool } from './create-hover-tool.js';
import { createNavigateTool } from './create-navigate-tool.js';
import { createPressKeyTool } from './create-press-key-tool.js';
import { createReloadTool } from './create-reload-tool.js';
import { createEvalJsTool } from './create-eval-js-tool.js';
import { createGetStylesTool } from './create-get-styles-tool.js';
import { AgentBrowserToolRegistry } from './AgentBrowserToolRegistry.js';
import { createScreenshotTool } from './create-screenshot-tool.js';
import { createScrollTool } from './create-scroll-tool.js';
import { createSelectTool } from './create-select-tool.js';
import { createSnapshotTool } from './create-snapshot-tool.js';
import { createTypeTextTool } from './create-type-text-tool.js';
import type { AgentBrowserToolContext, AgentBrowserToolList, DefineTool } from './types.js';
import { createWaitTool } from './create-wait-tool.js';

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
