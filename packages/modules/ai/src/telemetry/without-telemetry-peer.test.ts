import { afterEach, describe, expect, it, vi } from 'vitest';
import { from, type Observable } from 'rxjs';

import { BaseService } from '../lib/BaseService.js';
import { STRATEGY_TYPE } from '../lib/strategies/static.js';
import type { IModel } from '../lib/types.js';

// Simulates consumers that omit the optional telemetry peer: resolving it fails.
vi.mock('@equinor/fusion-framework-module-telemetry', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});
vi.mock('@equinor/fusion-framework-module-telemetry/utils', () => {
  throw new Error('Cannot find package @equinor/fusion-framework-module-telemetry');
});

afterEach(() => vi.restoreAllMocks());

/** Minimal custom-strategy model. */
class EchoModel extends BaseService<string, string> {
  /** Placeholder for the `IModel.llm` contract. */
  readonly llm = {};
  /**
   * @param input - Prompt to echo.
   * @returns The prompt.
   */
  invoke$(input: string): Observable<string> {
    return from([input]);
  }
}

const model = new EchoModel();
// The echo model implements the IModel surface these tests use.
const asModel = (): IModel => model as unknown as IModel;
const strategies = [{ name: 'echo', type: STRATEGY_TYPE.MODEL, createModel: asModel }];

describe('AI without the optional telemetry peer', () => {
  it('uses a provider-supplied scope without importing the optional peer', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { AiProvider } = await import('../AiProvider.js');
    const provider = new AiProvider({ strategies } as never);
    const handle = { connect: vi.fn(), disconnect: vi.fn(), report: vi.fn() };
    const scope = vi.fn(() => handle);
    await provider.connectTelemetry({ scope } as never);
    const client = provider.useModel('m', { strategy: 'echo' });
    await expect(client.invoke('hello')).resolves.toBe('hello');
    expect(scope).toHaveBeenCalledWith('ai');
    expect(handle.report).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'model-invoke',
        outcome: 'success',
      }),
    );
    provider.dispose();
    expect(handle.disconnect).toHaveBeenCalledOnce();
    expect(warn).not.toHaveBeenCalled();
  });

  it('loads and runs AI executions without telemetry', async () => {
    const { AiProvider } = await import('../AiProvider.js');
    const provider = new AiProvider({ strategies } as never);
    await provider.connectTelemetry(undefined);

    const client = provider.useModel('m', { strategy: 'echo' });

    expect(client).toBe(model);
    await expect(client.invoke('hello')).resolves.toBe('hello');
  });

  it('stays uninstrumented when telemetry is offered but its package cannot load', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const { AiProvider } = await import('../AiProvider.js');
    const provider = new AiProvider({ strategies } as never);
    const track = vi.fn();

    // Only the members the reporter would use are faked; the reporter never loads.
    await provider.connectTelemetry({ source: { hostId: 'h' }, track } as never);
    const client = provider.useModel('m', { strategy: 'echo' });

    expect(client).toBe(model);
    await expect(client.invoke('hello')).resolves.toBe('hello');
    expect(track).not.toHaveBeenCalled();
    expect(warn).toHaveBeenCalledWith('AI operational telemetry is unavailable');
  });
});
