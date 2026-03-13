import type { ChatExecutionCallbacks, ChatExecutionResult, ChatExecutor } from './types.js';
import { createSdkChatAdapter, type SdkChatAdapter } from './sdk-adapter.js';

/**
 * Options for creating SDK executor instances.
 */
export interface CreateSdkChatExecutorOptions {
  env?: NodeJS.ProcessEnv;
  adapter?: SdkChatAdapter;
}

/**
 * Creates an SDK-mode executor using a pluggable SDK adapter.
 * @param options - Optional adapter and environment settings.
 * @returns SDK executor.
 */
export function createSdkChatExecutor(options: CreateSdkChatExecutorOptions = {}): ChatExecutor {
  const adapter = options.adapter ?? createSdkChatAdapter({ env: options.env });

  return {
    mode: 'sdk',
    execute: (prompt, cwd, executionOptions, callbacks) =>
      runSdkAdapter(adapter, { prompt, cwd, options: executionOptions }, callbacks),
  };
}

async function runSdkAdapter(
  adapter: SdkChatAdapter,
  input: { prompt: string; cwd: string; options: { model?: string; agent?: string } },
  callbacks: ChatExecutionCallbacks,
): Promise<ChatExecutionResult> {
  callbacks.onProgress(`SDK executor selected (adapter: ${adapter.mode}).`);
  return adapter.execute(input, callbacks);
}
