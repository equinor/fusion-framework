import type { ChatExecutionCallbacks, ChatExecutionOptions, ChatExecutionResult } from './types.js';

/**
 * Input payload for SDK adapter execution.
 */
export interface SdkAdapterInput {
  prompt: string;
  cwd: string;
  options: ChatExecutionOptions;
}

/**
 * Supported SDK adapter implementations.
 */
export type SdkAdapterMode = 'disabled' | 'mock';

/**
 * Contract implemented by SDK adapters.
 */
export interface SdkChatAdapter {
  mode: SdkAdapterMode;
  execute: (
    input: SdkAdapterInput,
    callbacks: ChatExecutionCallbacks,
  ) => Promise<ChatExecutionResult>;
}

/**
 * Options for creating SDK adapters.
 */
export interface CreateSdkAdapterOptions {
  env?: NodeJS.ProcessEnv;
}

/**
 * Resolves SDK adapter mode from environment.
 * @param options - Optional environment source.
 * @returns Selected SDK adapter mode.
 */
export function resolveSdkAdapterMode(options: CreateSdkAdapterOptions = {}): SdkAdapterMode {
  const env = options.env ?? process.env;
  const requested = env.FUSION_AI_STUDIO_SDK_ADAPTER?.trim().toLowerCase();
  return requested === 'mock' ? 'mock' : 'disabled';
}

/**
 * Creates the SDK adapter implementation for runtime configuration.
 * @param options - Optional adapter selection settings.
 * @returns SDK adapter.
 */
export function createSdkChatAdapter(options: CreateSdkAdapterOptions = {}): SdkChatAdapter {
  const mode = resolveSdkAdapterMode(options);
  return mode === 'mock' ? createMockSdkAdapter() : createDisabledSdkAdapter();
}

function createDisabledSdkAdapter(): SdkChatAdapter {
  return {
    mode: 'disabled',
    execute: async (_input, callbacks) => {
      callbacks.onProgress('SDK adapter is disabled. Falling back to local draft planner.');

      return {
        ok: false,
        message: 'SDK adapter is disabled. Falling back to draft planner.',
        assistantText: 'SDK adapter is disabled in this build.',
      };
    },
  };
}

function createMockSdkAdapter(): SdkChatAdapter {
  return {
    mode: 'mock',
    execute: async (input, callbacks) => {
      callbacks.onProgress('SDK mock adapter is handling this request.');
      callbacks.onAssistantChunk(`SDK mock response: ${input.prompt}`);

      return {
        ok: true,
        message: 'SDK mock adapter completed the request.',
        assistantText: `SDK mock response: ${input.prompt}`,
      };
    },
  };
}
