import { createCliChatExecutor } from './cli.js';
import { createSdkChatExecutor } from './sdk.js';
import type { ChatExecutor, ChatExecutorMode } from './types.js';

/**
 * Options for resolving chat executor mode.
 */
export interface ExecutorFactoryOptions {
  env?: NodeJS.ProcessEnv;
}

/**
 * Resolves requested executor mode from environment flags.
 * @param options - Optional environment source.
 * @returns Chosen executor mode.
 */
export function resolveChatExecutorMode(options: ExecutorFactoryOptions = {}): ChatExecutorMode {
  const env = options.env ?? process.env;
  const requested = env.FUSION_AI_STUDIO_EXECUTOR?.trim().toLowerCase();
  return requested === 'sdk' ? 'sdk' : 'cli';
}

/**
 * Creates a chat executor based on resolved runtime mode.
 * @param options - Optional mode resolution settings.
 * @returns Chat executor implementation.
 */
export function createChatExecutor(options: ExecutorFactoryOptions = {}): ChatExecutor {
  const mode = resolveChatExecutorMode(options);
  return mode === 'sdk' ? createSdkChatExecutor({ env: options.env }) : createCliChatExecutor();
}
