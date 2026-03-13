import { describe, expect, it, vi } from 'vitest';
import { createSdkChatExecutor } from '../src/executor/sdk.js';

describe('createSdkChatExecutor', () => {
  it('returns sdk mode executor', () => {
    const executor = createSdkChatExecutor();
    expect(executor.mode).toBe('sdk');
  });

  it('reports disabled adapter state and emits progress', async () => {
    const executor = createSdkChatExecutor();
    const onProgress = vi.fn();

    const result = await executor.execute(
      'prompt',
      process.cwd(),
      {},
      {
        onProgress,
        onAssistantChunk: vi.fn(),
        onOperation: vi.fn(),
      },
    );

    expect(onProgress).toHaveBeenCalledWith('SDK executor selected (adapter: disabled).');
    expect(onProgress).toHaveBeenCalledWith(
      'SDK adapter is disabled. Falling back to local draft planner.',
    );
    expect(result).toEqual({
      ok: false,
      message: 'SDK adapter is disabled. Falling back to draft planner.',
      assistantText: 'SDK adapter is disabled in this build.',
    });
  });

  it('supports mock adapter success mode through env', async () => {
    const executor = createSdkChatExecutor({
      env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'mock' },
    });
    const onProgress = vi.fn();
    const onAssistantChunk = vi.fn();

    const result = await executor.execute(
      'implement dashboard title update',
      process.cwd(),
      {},
      {
        onProgress,
        onAssistantChunk,
        onOperation: vi.fn(),
      },
    );

    expect(onProgress).toHaveBeenCalledWith('SDK executor selected (adapter: mock).');
    expect(onProgress).toHaveBeenCalledWith('SDK mock adapter is handling this request.');
    expect(onAssistantChunk).toHaveBeenCalledWith(
      'SDK mock response: implement dashboard title update',
    );
    expect(result).toEqual({
      ok: true,
      message: 'SDK mock adapter completed the request.',
      assistantText: 'SDK mock response: implement dashboard title update',
    });
  });
});
