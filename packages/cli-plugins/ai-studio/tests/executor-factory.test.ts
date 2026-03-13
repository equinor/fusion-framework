import { describe, expect, it } from 'vitest';
import { createChatExecutor, resolveChatExecutorMode } from '../src/executor/factory.js';

describe('resolveChatExecutorMode', () => {
  it('defaults to cli when env is missing', () => {
    expect(resolveChatExecutorMode({ env: {} })).toBe('cli');
  });

  it('selects sdk when env requests sdk', () => {
    expect(resolveChatExecutorMode({ env: { FUSION_AI_STUDIO_EXECUTOR: 'sdk' } })).toBe('sdk');
  });

  it('falls back to cli for unsupported values', () => {
    expect(resolveChatExecutorMode({ env: { FUSION_AI_STUDIO_EXECUTOR: 'unknown' } })).toBe('cli');
  });
});

describe('createChatExecutor', () => {
  it('creates cli executor by default', () => {
    const executor = createChatExecutor({ env: {} });
    expect(executor.mode).toBe('cli');
  });

  it('creates sdk executor when sdk mode is requested', () => {
    const executor = createChatExecutor({ env: { FUSION_AI_STUDIO_EXECUTOR: 'sdk' } });
    expect(executor.mode).toBe('sdk');
  });
});
