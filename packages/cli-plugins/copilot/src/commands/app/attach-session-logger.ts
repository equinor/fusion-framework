import chalk from 'chalk';
import ora from 'ora';

import type { CopilotSession, JsonValue } from '@github/copilot-sdk';

import { tryFormatMessage } from './try-format-message.js';

/**
 * Extracts the first string-valued property found among `keys` on a tool-call's
 * JSON arguments, narrowing the untyped `JsonValue` union to its object branch first.
 * @param value - The tool-call arguments to inspect, as reported by the Copilot SDK
 * @param keys - Property names to check, in priority order
 * @returns The first matching string value, or `undefined` if none match
 */
function firstStringProp(value: JsonValue | undefined, keys: string[]): string | undefined {
  // Primitives and arrays have no named properties to read
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return undefined;
  }
  // Return the first key present with a string value, in caller-specified priority order
  for (const key of keys) {
    const prop = value[key];
    // Skip non-string values (numbers, nested objects, etc.) rather than stringifying them
    if (typeof prop === 'string') return prop;
  }
  return undefined;
}

const TOOL_ICONS: Record<string, string> = {
  browser_screenshot: '📷',
  browser_navigate: '🌐',
  browser_click: '👆',
  browser_wait: '⏳',
  browser_type: '⌨️',
  browser_scroll: '📜',
  browser_snapshot: '🔍',
};

/**
 * Attaches a console logger to a Copilot session that renders tool progress
 * with a single shared ora spinner (avoiding concurrent-spinner warnings).
 *
 * @param session - The active Copilot SDK session
 * @param options - Optional config (e.g. requested model name for mismatch detection)
 * @returns A handle with `stop()` to tear down the spinner (e.g. on SIGINT)
 */
export function attachSessionLogger(
  session: CopilotSession,
  options?: { requestedModel?: string },
): { stop: () => void } {
  const pendingTools = new Map<string, string>();
  let spinner: ReturnType<typeof ora> | null = null;

  function syncSpinner(): void {
    // No pending tools means the spinner has nothing left to show
    if (pendingTools.size === 0) {
      // Stop the spinner only if one was actually running
      if (spinner) {
        spinner.stop();
        spinner = null;
      }
      return;
    }
    const text = [...pendingTools.values()].join(chalk.dim(' | '));
    // Reuse the existing spinner instance rather than starting a second one
    if (spinner) {
      spinner.text = text;
    } else {
      spinner = ora({ text, color: 'cyan' }).start();
    }
  }

  function pauseSpinner(): void {
    // Only stop the spinner if one is actually running
    if (spinner) {
      spinner.stop();
      spinner = null;
    }
  }

  function logCompletion(label: string, ok: boolean): void {
    pauseSpinner();
    const prefix = ok ? chalk.green('✔') : chalk.red('✖');
    console.log(`${prefix} ${label}`);
    syncSpinner();
  }

  session.on((event) => {
    // Dispatch on the Copilot SDK session event type to render the right log line
    switch (event.type) {
      case 'tool.execution_start': {
        const { toolCallId, toolName, arguments: args } = event.data;
        const detail = firstStringProp(args, ['url', 'path', 'load', 'selector']);
        const icon = TOOL_ICONS[toolName] ?? '🔧';
        const label =
          typeof detail === 'string' ? `${icon} ${toolName} (${detail})` : `${icon} ${toolName}`;
        pendingTools.set(toolCallId, label);
        syncSpinner();
        break;
      }
      case 'tool.execution_complete': {
        const label = pendingTools.get(event.data.toolCallId);
        // Only log completion for tools we actually tracked the start of
        if (label) {
          pendingTools.delete(event.data.toolCallId);
          logCompletion(label, event.data.success);
        }
        break;
      }
      case 'external_tool.completed': {
        const label = pendingTools.get(event.data.requestId);
        // Only log completion for tools we actually tracked the start of
        if (label) {
          pendingTools.delete(event.data.requestId);
          logCompletion(label, true);
        }
        break;
      }
      case 'assistant.reasoning': {
        pauseSpinner();
        console.log(chalk.dim(`🧠 ${event.data.content}`));
        syncSpinner();
        break;
      }
      case 'assistant.message': {
        // Skip empty assistant messages (e.g. tool-only turns)
        if (event.data.content) {
          pauseSpinner();
          const formatted = tryFormatMessage(event.data.content);
          // Prefer the structured plan/verdict/step-result rendering when recognised
          if (formatted) {
            console.log(formatted);
          } else {
            console.log(chalk.green(`🤖 ${event.data.content}`));
          }
          syncSpinner();
        }
        break;
      }
      case 'permission.requested': {
        const { requestId, permissionRequest } = event.data;
        const toolName =
          permissionRequest.kind === 'custom-tool'
            ? permissionRequest.toolName
            : permissionRequest.kind;
        pendingTools.set(requestId, `🔐 ${toolName}`);
        syncSpinner();
        break;
      }
      case 'permission.completed': {
        const label = pendingTools.get(event.data.requestId);
        // Only log completion for permissions we actually tracked the request of
        if (label) {
          const approved = event.data.result?.kind === 'approved';
          pendingTools.delete(event.data.requestId);
          logCompletion(label, approved);
        }
        break;
      }
      case 'session.tools_updated': {
        const negotiatedModel = event.data.model as string | undefined;
        // Only log tooling info once the server has actually negotiated a model
        if (negotiatedModel) {
          console.log(chalk.dim(`💾  ${negotiatedModel}`));
          // Warn the user when the server picked a different model than requested
          if (options?.requestedModel && negotiatedModel !== options.requestedModel) {
            console.log(
              chalk.yellow(
                `⚠️  Requested model "${options.requestedModel}" but server negotiated "${negotiatedModel}"`,
              ),
            );
          }
        }
        break;
      }
      case 'external_tool.requested':
      case 'user.message': {
        break;
      }
      case 'assistant.message_delta':
      case 'assistant.reasoning_delta':
      case 'assistant.streaming_delta':
      case 'assistant.turn_start':
      case 'assistant.turn_end':
      case 'assistant.usage':
      case 'pending_messages.modified':
      case 'session.idle':
      case 'session.usage_info': {
        break;
      }
      case 'session.info': {
        const { message } = event.data as { message?: string };
        // Skip empty info events
        if (message) {
          pauseSpinner();
          console.log(chalk.dim(`ℹ️  ${message}`));
          syncSpinner();
        }
        break;
      }
      case 'assistant.intent': {
        const { intent } = event.data as { intent?: string };
        // Skip empty intent events
        if (intent) {
          pauseSpinner();
          console.log(chalk.yellow(`🎯 ${intent}`));
          syncSpinner();
        }
        break;
      }
      default:
        console.log(event);
        break;
    }
  });

  return {
    stop: () => pauseSpinner(),
  };
}
