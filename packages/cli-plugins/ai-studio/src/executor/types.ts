import type { ParsedOperationLine } from '../copilot-stream.js';

/**
 * Supported executor modes for ai-studio chat execution.
 */
export type ChatExecutorMode = 'cli' | 'sdk';

/**
 * Options used when executing a chat request.
 */
export interface ChatExecutionOptions {
  model?: string;
  agent?: string;
}

/**
 * Callbacks emitted while an executor runs.
 */
export interface ChatExecutionCallbacks {
  onProgress: (message: string) => void;
  onAssistantChunk: (chunk: string) => void;
  onOperation: (operation: ParsedOperationLine) => void;
}

/**
 * Execution result for a single chat request.
 */
export interface ChatExecutionResult {
  ok: boolean;
  message: string;
  assistantText: string;
}

/**
 * Interface implemented by ai-studio chat executors.
 */
export interface ChatExecutor {
  mode: ChatExecutorMode;
  execute: (
    prompt: string,
    cwd: string,
    options: ChatExecutionOptions,
    callbacks: ChatExecutionCallbacks,
  ) => Promise<ChatExecutionResult>;
}
