import type { ChatExecutionCallbacks, ChatExecutionOptions, ChatExecutionResult } from './types.js';
import type { ParsedOperationLine } from '../copilot-stream.js';

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
export type SdkAdapterMode = 'disabled' | 'mock' | 'http';

/**
 * Minimal fetch response shape used by SDK HTTP adapter.
 */
export interface SdkAdapterFetchResponse {
  ok: boolean;
  status: number;
  text: () => Promise<string>;
}

/**
 * Minimal fetch function shape used by SDK HTTP adapter.
 */
export type SdkAdapterFetch = (
  url: string,
  init: {
    method: 'POST';
    headers: Record<string, string>;
    body: string;
    signal: AbortSignal;
  },
) => Promise<SdkAdapterFetchResponse>;

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
  fetchFn?: SdkAdapterFetch;
}

/**
 * Resolves SDK adapter mode from environment.
 * @param options - Optional environment source.
 * @returns Selected SDK adapter mode.
 */
export function resolveSdkAdapterMode(options: CreateSdkAdapterOptions = {}): SdkAdapterMode {
  const env = options.env ?? process.env;
  const requested = env.FUSION_AI_STUDIO_SDK_ADAPTER?.trim().toLowerCase();
  if (requested === 'mock') {
    return 'mock';
  }
  return requested === 'http' ? 'http' : 'disabled';
}

/**
 * Creates the SDK adapter implementation for runtime configuration.
 * @param options - Optional adapter selection settings.
 * @returns SDK adapter.
 */
export function createSdkChatAdapter(options: CreateSdkAdapterOptions = {}): SdkChatAdapter {
  const mode = resolveSdkAdapterMode(options);
  if (mode === 'mock') {
    return createMockSdkAdapter();
  }

  if (mode === 'http') {
    return createHttpSdkAdapter(options);
  }

  return createDisabledSdkAdapter();
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

function createHttpSdkAdapter(options: CreateSdkAdapterOptions): SdkChatAdapter {
  return {
    mode: 'http',
    execute: async (input, callbacks) => {
      const env = options.env ?? process.env;
      const endpoint = env.FUSION_AI_STUDIO_SDK_ENDPOINT?.trim();
      if (!endpoint) {
        callbacks.onProgress('SDK HTTP adapter is missing endpoint configuration.');
        return {
          ok: false,
          message:
            'SDK HTTP adapter requires FUSION_AI_STUDIO_SDK_ENDPOINT. Falling back to draft planner.',
          assistantText: 'SDK HTTP adapter endpoint is not configured.',
        };
      }

      const fetchFn = options.fetchFn ?? createRuntimeFetch();
      if (!fetchFn) {
        callbacks.onProgress('SDK HTTP adapter cannot find a runtime fetch implementation.');
        return {
          ok: false,
          message: 'SDK HTTP adapter requires fetch support in this runtime.',
          assistantText: 'SDK HTTP adapter is unavailable in this runtime.',
        };
      }

      const timeoutMs = resolveHttpTimeoutMs(env);
      const abortController = new AbortController();
      const timeoutId = setTimeout(() => {
        abortController.abort();
      }, timeoutMs);

      callbacks.onProgress(`SDK HTTP adapter sending request to ${endpoint}.`);

      try {
        const response = await fetchFn(endpoint, {
          method: 'POST',
          headers: {
            'content-type': 'application/json',
          },
          body: JSON.stringify({
            prompt: input.prompt,
            cwd: input.cwd,
            model: input.options.model,
            agent: input.options.agent,
          }),
          signal: abortController.signal,
        });

        const rawBody = await response.text();
        if (!response.ok) {
          return {
            ok: false,
            message: `SDK HTTP adapter request failed with status ${response.status}.`,
            assistantText: rawBody || 'SDK HTTP adapter returned a non-success status.',
          };
        }

        const parsed = parseHttpSdkResponse(rawBody);
        if (!parsed) {
          return {
            ok: false,
            message: 'SDK HTTP adapter returned invalid JSON response payload.',
            assistantText: rawBody,
          };
        }

        for (const progress of parsed.progress) {
          callbacks.onProgress(progress);
        }
        for (const token of parsed.tokens) {
          callbacks.onAssistantChunk(token);
        }
        for (const operation of parsed.operations) {
          callbacks.onOperation(operation);
        }

        return {
          ok: parsed.ok,
          message: parsed.message,
          assistantText: parsed.assistantText,
        };
      } catch (error) {
        const aborted = error instanceof Error && error.name === 'AbortError';
        return {
          ok: false,
          message: aborted
            ? `SDK HTTP adapter request timed out after ${timeoutMs}ms.`
            : 'SDK HTTP adapter request failed.',
          assistantText: error instanceof Error ? error.message : 'Unknown SDK HTTP adapter error.',
        };
      } finally {
        clearTimeout(timeoutId);
      }
    },
  };
}

function resolveHttpTimeoutMs(env: NodeJS.ProcessEnv): number {
  const parsed = Number.parseInt(env.FUSION_AI_STUDIO_SDK_TIMEOUT_MS ?? '', 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 15000;
  }

  return Math.min(parsed, 120000);
}

function createRuntimeFetch(): SdkAdapterFetch | undefined {
  if (!globalThis.fetch) {
    return undefined;
  }

  return async (url, init) => {
    const response = await globalThis.fetch(url, init);
    return {
      ok: response.ok,
      status: response.status,
      text: async () => response.text(),
    };
  };
}

interface HttpSdkResponse {
  ok: boolean;
  message: string;
  assistantText: string;
  progress: string[];
  tokens: string[];
  operations: ParsedOperationLine[];
}

function parseHttpSdkResponse(payload: string): HttpSdkResponse | null {
  if (!payload.trim()) {
    return null;
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(payload);
  } catch {
    return null;
  }

  if (!isRecord(parsed) || typeof parsed.ok !== 'boolean') {
    return null;
  }

  const message =
    typeof parsed.message === 'string' ? parsed.message : 'SDK HTTP adapter completed.';
  const assistantText = typeof parsed.assistantText === 'string' ? parsed.assistantText : '';
  const progress = toStringArray(parsed.progress);
  const tokens = toStringArray(parsed.tokens);
  const operations = toOperationArray(parsed.operations);

  return {
    ok: parsed.ok,
    message,
    assistantText,
    progress,
    tokens,
    operations,
  };
}

function toStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === 'string');
}

function toOperationArray(value: unknown): ParsedOperationLine[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((item) => {
    if (!isRecord(item) || typeof item.operation !== 'string' || typeof item.message !== 'string') {
      return [];
    }

    if (!isParsedOperation(item.operation)) {
      return [];
    }

    return [
      {
        operation: item.operation,
        message: item.message,
        kind: isOperationKind(item.kind) ? item.kind : undefined,
        target: typeof item.target === 'string' ? item.target : undefined,
        additions: typeof item.additions === 'number' ? item.additions : undefined,
        deletions: typeof item.deletions === 'number' ? item.deletions : undefined,
      },
    ];
  });
}

function isParsedOperation(value: string): value is ParsedOperationLine['operation'] {
  return ['glob', 'list', 'search', 'read', 'edit', 'detail'].includes(value);
}

function isOperationKind(value: unknown): value is NonNullable<ParsedOperationLine['kind']> {
  return value === 'info' || value === 'warning' || value === 'error';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}
