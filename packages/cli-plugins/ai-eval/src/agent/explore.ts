import { appendFileSync } from 'node:fs';
import type { AIMessage } from '@langchain/core/messages';
import { HumanMessage, SystemMessage, ToolMessage } from '@langchain/core/messages';
import type { IModel, ModelTool } from '@equinor/fusion-framework-module-ai/lib';
import type { BrowserTools } from '../browser-tools.js';
import { type Evidence, type PlanStep, EvidenceSchema } from '../types.js';
import { buildExploreMessages } from '../prompts/explore.prompt.js';
import type { AgentOptions } from './types.js';

/**
 * Runs the Explorer phase for a single plan step.
 *
 * Uses `model.bindTools(tools)` to enable LangChain tool calling. The Explorer
 * runs in a loop: invoke the model → execute requested tool calls → append
 * results → repeat, until the model returns a response with no tool calls.
 *
 * The returned {@link Evidence} includes the full tool call audit trail. Use
 * `sanitiseEvidence` before passing evidence to the Judge.
 *
 * @param step - The plan step to collect evidence for.
 * @param appUrl - Base URL of the running application.
 * @param model - Initialized AI model instance.
 * @param tools - LangChain browser tool instances from `createBrowserTools`.
 * @param options - Agent options (verbose, etc.).
 * @returns Raw {@link Evidence} including tool call audit metadata.
 */
export async function explore(
  step: PlanStep,
  appUrl: string,
  model: IModel,
  tools: BrowserTools,
  options: AgentOptions = {},
): Promise<Evidence> {
  if (options.verbose) {
    console.log(`\n🔍 Explorer: collecting evidence for "${step.criterion}"`);
  }

  // Build a tool name → executor map for the loop.
  const toolMap = new Map(tools.map((t) => [t.name, t])) as Map<
    string,
    { invoke: (args: Record<string, unknown>) => Promise<unknown> }
  >;

  // Navigate and wait in code — always, unconditionally.
  // This removes navigation from the model's responsibility entirely.
  const navigateTool = toolMap.get('browser_navigate');
  const waitTool = toolMap.get('browser_wait');
  const targetUrl = step.route ? `${appUrl}${step.route}` : appUrl;
  // Clear the console buffer before navigation so captures are scoped to this step.
  const consoleTool = toolMap.get('browser_console');
  if (consoleTool) {
    try { await consoleTool.invoke({ clear: true }); } catch { /* ignore */ }
  }

  if (navigateTool) {
    if (options.verbose) console.log(`  🌐 Navigating to ${targetUrl}`);
    try { await navigateTool.invoke({ url: targetUrl }); } catch { /* ignore */ }
  }
  if (waitTool) {
    if (options.verbose) console.log('  ⏳ Waiting for page load + JS settle');
    try { await waitTool.invoke({ condition: 'load' }); } catch { /* ignore */ }
    try { await waitTool.invoke({ condition: 'ms', value: 1500 }); } catch { /* ignore */ }
  }

  // Bind all tools to the model for any interaction the step requires.
  const boundModel = model.bindTools([...tools] as unknown as ModelTool[]);

  const [systemMsg, userMsg] = buildExploreMessages(step, appUrl);

  const messages: Parameters<typeof boundModel.invoke>[0] = [
    new SystemMessage(systemMsg.content),
    new HumanMessage(userMsg.content),
  ];

  const toolCallNames: string[] = [];
  let totalCalls = 0;
  let lastSnapshot = '';
  let lastScreenshotPath: string | undefined;

  // Tool-calling loop: invoke → execute tools → append results → repeat
  for (;;) {
    const response = (await boundModel.invoke(messages)) as AIMessage;
    messages.push(response);

    // No tool calls → Explorer has finished
    if (!response.tool_calls || response.tool_calls.length === 0) {
      if (options.verbose) {
        console.log(`  ✅ Explorer done after ${totalCalls} tool call(s)`);
      }
      break;
    }

    // Execute each tool call and append results
    for (const toolCall of response.tool_calls) {
      const toolFn = toolMap.get(toolCall.name);
      if (!toolFn) {
        messages.push(
          new ToolMessage({
            tool_call_id: toolCall.id ?? toolCall.name,
            content: `Unknown tool: ${toolCall.name}`,
          }),
        );
        continue;
      }

      toolCallNames.push(toolCall.name);
      totalCalls++;

      if (options.verbose) {
        const args = JSON.stringify(toolCall.args ?? {});
        console.log(`  🔧 ${toolCall.name}(${args.slice(0, 100)})`);
      }

      let result: string;
      try {
        result = String(await toolFn.invoke(toolCall.args ?? {}));
      } catch (err) {
        result = `Tool error: ${err instanceof Error ? err.message : String(err)}`;
      }

      if (options.toolLogPath) {
        try {
          const entry = JSON.stringify({
            ts: new Date().toISOString(),
            tool: toolCall.name,
            args: toolCall.args ?? {},
            response: result,
          });
          appendFileSync(options.toolLogPath, `${entry}\n`, 'utf-8');
        } catch { /* non-fatal */ }
      }

      // Capture the last snapshot and screenshot path for the Evidence record
      if (toolCall.name === 'browser_snapshot') {
        lastSnapshot = result;
      }
      if (toolCall.name === 'browser_screenshot') {
        // agent-browser prints: "✓ Screenshot saved to /path/to/file.jpg"
        const match = result.match(/screenshot saved to (.+\.(?:jpg|jpeg|png|webp))/i);
        if (match) {
          lastScreenshotPath = match[1].trim();
        }
      }

      messages.push(
        new ToolMessage({
          tool_call_id: toolCall.id ?? toolCall.name,
          content: result,
        }),
      );
    }
  }

  // Guarantee: always take a snapshot and screenshot after the model loop.
  // The model may have already called them, but we unconditionally refresh here
  // so evidence is never empty due to model non-compliance.
  const snapshotTool = toolMap.get('browser_snapshot');
  const screenshotTool = toolMap.get('browser_screenshot');

  if (snapshotTool && !lastSnapshot) {
    if (options.verbose) console.log('  📄 Forced snapshot (model skipped it)');
    try { lastSnapshot = String(await snapshotTool.invoke({})); } catch { /* ignore */ }
  }

  if (screenshotTool && !lastScreenshotPath) {
    if (options.verbose) console.log('  📸 Forced screenshot (model skipped it)');
    try {
      const raw = String(await screenshotTool.invoke({}));
      const match = raw.match(/screenshot saved to (.+\.(?:jpg|jpeg|png|webp))/i);
      if (match) lastScreenshotPath = match[1].trim();
    } catch { /* ignore */ }
  }

  const evidence: Evidence = {
    stepId: step.id,
    toolCalls: toolCallNames,
    toolCallCount: totalCalls,
    snapshot: lastSnapshot,
    ...(lastScreenshotPath ? { screenshotPath: lastScreenshotPath } : {}),
  };

  return EvidenceSchema.parse(evidence);
}
