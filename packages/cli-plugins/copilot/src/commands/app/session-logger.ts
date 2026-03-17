import chalk from 'chalk';
import ora from 'ora';

import type { CopilotSession } from '@github/copilot-sdk';

import { tryFormatMessage } from './format.js';

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
    if (pendingTools.size === 0) {
      if (spinner) {
        spinner.stop();
        spinner = null;
      }
      return;
    }
    const text = [...pendingTools.values()].join(chalk.dim(' | '));
    if (spinner) {
      spinner.text = text;
    } else {
      spinner = ora({ text, color: 'cyan' }).start();
    }
  }

  function pauseSpinner(): void {
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
    switch (event.type) {
      case 'tool.execution_start': {
        const { toolCallId, toolName, arguments: args } = event.data;
        const detail = args?.url ?? args?.path ?? args?.load ?? args?.selector;
        const icon = TOOL_ICONS[toolName] ?? '🔧';
        const label =
          typeof detail === 'string'
            ? `${icon} ${toolName} (${detail})`
            : `${icon} ${toolName}`;
        pendingTools.set(toolCallId, label);
        syncSpinner();
        break;
      }
      case 'tool.execution_complete': {
        const label = pendingTools.get(event.data.toolCallId);
        if (label) {
          pendingTools.delete(event.data.toolCallId);
          logCompletion(label, event.data.success);
        }
        break;
      }
      case 'external_tool.completed': {
        const label = pendingTools.get(event.data.requestId);
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
        if (event.data.content) {
          pauseSpinner();
          const formatted = tryFormatMessage(event.data.content);
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
        if (label) {
          const approved = event.data.result?.kind === 'approved';
          pendingTools.delete(event.data.requestId);
          logCompletion(label, approved);
        }
        break;
      }
      // @ts-expect-error - missing case types in SDK typings
      case 'session.tools_updated': {
        // @ts-expect-error - model property missing in SDK typings
        const negotiatedModel = event.data.model as string | undefined;
        if (negotiatedModel) {
          console.log(chalk.dim(`💾  ${negotiatedModel}`));
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
        if (message) {
          pauseSpinner();
          console.log(chalk.dim(`ℹ️  ${message}`));
          syncSpinner();
        }
        break;
      }
      case 'assistant.intent': {
        const { intent } = event.data as { intent?: string };
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
