import { mkdirSync } from 'node:fs';
import { join } from 'node:path';

import { ab, abErrorMessage } from '../../utils/index.js';
import { createAgentBrowserTools } from './tools/index.js';
import { createWriteFileTool, createAppendFileTool } from './tools/write-file.js';
import { createReadFileTool } from './tools/read-file.js';
import type { RuntimeExecutionContext } from './types.js';
import type { CopilotSession, SessionConfig } from '@github/copilot-sdk';
import { createSystemPrompt } from './prompts/system.prompt.js';
import { createDevServerContext } from './prompts/system.dev-server.prompt.js';

/**
 * Lazily imports the Copilot SDK to avoid module resolution errors at CLI startup.
 *
 * The SDK depends on `vscode-jsonrpc/node` which may fail under certain Node versions
 * when loaded eagerly via static imports.
 *
 * @returns The Copilot SDK module namespace
 */
async function loadCopilotSdk(): Promise<typeof import('@github/copilot-sdk')> {
  return await import('@github/copilot-sdk');
}

type SessionOptions = {
  ctx: RuntimeExecutionContext;
  defaultToolTimeoutMs?: number;
  config?: Omit<
    SessionConfig,
    'onPermissionRequest' | 'systemMessage' | 'availableTools' | 'excludedTools'
  >;
};

export const createSession = async (
  options: SessionOptions,
): Promise<CopilotSession> => {
  const { ctx, config, defaultToolTimeoutMs } = options;

  const { CopilotClient, defineTool, approveAll } = await loadCopilotSdk();
  const client = new CopilotClient({ autoStart: true });
  await client.start();

  const fileTools = [
    createReadFileTool(ctx.outDir, defineTool),
    createWriteFileTool(ctx.outDir, defineTool),
    createAppendFileTool(ctx.outDir, defineTool),
  ];

  const tools = [
    ...createBrowserTools(defineTool, {
      cwd: ctx.outDir,
      timeoutMs: defaultToolTimeoutMs,
    }),
    ...fileTools,
    ...(config?.tools ?? []),
  ];

  // Exclude dangerous built-in tools; names vary across model providers
  // so a blocklist is more robust than an allowlist.
  const excludedTools = [
    'bash',
    'list_bash',
    'read_bash',
    'write_bash',
    'stop_bash',
    'sql',
    'web_fetch',
    'skill',
    'list_agents',
    'read_agent',
    'glob',
    'rg',
    'view',
    'task',
  ];

  const session = await client.createSession({
    ...config,
    tools,
    excludedTools,
    systemMessage: {
      mode: 'replace',
      content: `${createSystemPrompt(ctx)}\n\n## Dev Server${createDevServerContext(ctx)}`,
    },
    streaming: true,
    onPermissionRequest: approveAll,
  });

  return session;
};

/**
 * Creates the `agent-browser` tool definitions for the Copilot SDK session.
 *
 * Each tool wraps an `agent-browser` CLI subcommand so the Copilot agent can
 * autonomously navigate and inspect a running Fusion application.
 *
 * @param defineTool - The `defineTool` helper from the Copilot SDK
 * @returns Array of Copilot SDK tool definitions for browser interaction
 */
function createBrowserTools(
  defineTool: Awaited<ReturnType<typeof loadCopilotSdk>>['defineTool'],
  options?: { cwd?: string; timeoutMs?: number },
): ReturnType<typeof createAgentBrowserTools> {
  const outDir = join(options?.cwd ?? process.cwd(), 'evidence');
  mkdirSync(outDir, { recursive: true });
  const invoke = (args: string[], timeoutMs = options?.timeoutMs): string => {
    try {
      return ab(args, timeoutMs);
    } catch (err) {
      const msg = abErrorMessage(err);
      return `Error: ${msg}`;
    }
  };
  return createAgentBrowserTools({ outDir, invoke }, defineTool);
}
