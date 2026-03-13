import { describe, expect, it } from 'vitest';
import { createSdkChatAdapter, resolveSdkAdapterMode } from '../src/executor/sdk-adapter.js';

describe('resolveSdkAdapterMode', () => {
  it('defaults to disabled', () => {
    expect(resolveSdkAdapterMode({ env: {} })).toBe('disabled');
  });

  it('selects mock when configured', () => {
    expect(resolveSdkAdapterMode({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'mock' } })).toBe('mock');
  });

  it('selects http when configured', () => {
    expect(resolveSdkAdapterMode({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'http' } })).toBe('http');
  });
});

describe('createSdkChatAdapter', () => {
  it('creates disabled adapter by default', () => {
    const adapter = createSdkChatAdapter({ env: {} });
    expect(adapter.mode).toBe('disabled');
  });

  it('creates mock adapter when configured', () => {
    const adapter = createSdkChatAdapter({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'mock' } });
    expect(adapter.mode).toBe('mock');
  });

  it('creates http adapter when configured', () => {
    const adapter = createSdkChatAdapter({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'http' } });
    expect(adapter.mode).toBe('http');
  });

  it('http adapter fails fast when endpoint is missing', async () => {
    const adapter = createSdkChatAdapter({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'http' } });

    const result = await adapter.execute(
      {
        prompt: 'test',
        cwd: process.cwd(),
        options: {},
      },
      {
        onProgress: () => undefined,
        onAssistantChunk: () => undefined,
        onOperation: () => undefined,
      },
    );

    expect(result.ok).toBe(false);
    expect(result.message).toContain('FUSION_AI_STUDIO_SDK_ENDPOINT');
  });

  it('http adapter returns parsed success payload', async () => {
    const adapter = createSdkChatAdapter({
      env: {
        FUSION_AI_STUDIO_SDK_ADAPTER: 'http',
        FUSION_AI_STUDIO_SDK_ENDPOINT: 'http://localhost:9999/sdk',
      },
      fetchFn: async () => ({
        ok: true,
        status: 200,
        text: async () =>
          JSON.stringify({
            ok: true,
            message: 'done',
            assistantText: 'hello from sdk',
            progress: ['phase: run'],
            operations: [
              {
                operation: 'detail',
                kind: 'info',
                message: 'timeline event',
              },
            ],
            tokens: ['hello ', 'from ', 'sdk'],
          }),
      }),
    });

    const progress: string[] = [];
    const tokens: string[] = [];
    const operations: string[] = [];

    const result = await adapter.execute(
      {
        prompt: 'test',
        cwd: process.cwd(),
        options: {},
      },
      {
        onProgress: (message) => {
          progress.push(message);
        },
        onAssistantChunk: (chunk) => {
          tokens.push(chunk);
        },
        onOperation: (operation) => {
          operations.push(`${operation.operation}:${operation.message}`);
        },
      },
    );

    expect(result).toEqual({
      ok: true,
      message: 'done',
      assistantText: 'hello from sdk',
    });
    expect(progress).toContain('phase: run');
    expect(tokens).toEqual(['hello ', 'from ', 'sdk']);
    expect(operations).toEqual(['detail:timeline event']);
  });
});
