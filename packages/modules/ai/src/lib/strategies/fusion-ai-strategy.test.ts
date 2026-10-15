import { describe, expect, it, vi } from 'vitest';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import { fusionAiStrategy } from './fusion-ai-strategy.js';
import type { Strategy } from './types.js';

const createArgs = (): ConfigBuilderCallbackArgs =>
  ({
    hasModule: () => true,
    requireInstance: async (name: string) => ({ name }),
  }) as unknown as ConfigBuilderCallbackArgs;

describe('fusionAiStrategy', () => {
  it('passes the configured default headers to the strategy factory', async () => {
    const factory = vi.fn(async () => ({}) as Strategy);
    const headers = { 'X-Fusion-CLI-Name': 'my-tool' };

    await fusionAiStrategy(factory, () => headers)(createArgs());

    expect(factory).toHaveBeenCalledWith(expect.objectContaining({ defaultHeaders: headers }));
  });

  it('reads the headers when the strategy is resolved, not when it is registered', async () => {
    const factory = vi.fn(async () => ({}) as Strategy);
    let headers: Record<string, string> | undefined;
    const callback = fusionAiStrategy(factory, () => headers);

    headers = { 'X-Test': '1' };
    await callback(createArgs());

    expect(factory).toHaveBeenCalledWith(
      expect.objectContaining({ defaultHeaders: { 'X-Test': '1' } }),
    );
  });

  it('leaves default headers undefined when none are configured', async () => {
    const factory = vi.fn(async () => ({}) as Strategy);

    await fusionAiStrategy(factory)(createArgs());

    expect(factory).toHaveBeenCalledWith(expect.objectContaining({ defaultHeaders: undefined }));
  });

  it('rejects when a required module is missing', async () => {
    const args = {
      hasModule: () => false,
      requireInstance: vi.fn(),
    } as unknown as ConfigBuilderCallbackArgs;

    await expect(fusionAiStrategy(async () => ({}) as Strategy)(args)).rejects.toThrow(
      'Auth module is required',
    );
  });
});
