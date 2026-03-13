import { describe, expect, it } from 'vitest';
import { createSdkChatAdapter, resolveSdkAdapterMode } from '../src/executor/sdk-adapter.js';

describe('resolveSdkAdapterMode', () => {
  it('defaults to disabled', () => {
    expect(resolveSdkAdapterMode({ env: {} })).toBe('disabled');
  });

  it('selects mock when configured', () => {
    expect(resolveSdkAdapterMode({ env: { FUSION_AI_STUDIO_SDK_ADAPTER: 'mock' } })).toBe('mock');
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
});
