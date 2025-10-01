import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TelemetryConfigurator } from '../TelemetryConfigurator.js';
import type { TelemetryAdapter } from '../types.js';
import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';
import { resolveMetadata } from '../utils/resolve-metadata.js';
import { lastValueFrom } from 'rxjs';

function createAdapter(id: string): TelemetryAdapter {
  return {
    identifier: id,
    track: vi.fn() as TelemetryAdapter['track'],
  };
}

const createConfigCallbackArgs = (): ConfigBuilderCallbackArgs => ({
  hasModule: vi.fn(),
  requireInstance: vi.fn(),
});

describe('TelemetryConfigurator', () => {
  let configurator: TelemetryConfigurator;

  beforeEach(() => {
    configurator = new TelemetryConfigurator();
  });

  it('should be instantiable', () => {
    expect(configurator).toBeInstanceOf(TelemetryConfigurator);
  });

  it('setAdapter should add adapter and allow chaining', async () => {
    const adapterA = createAdapter('a');
    const adapterB = createAdapter('b');
    const result = configurator.setAdapter(adapterA).setAdapter(adapterB);
    expect(result).toBe(configurator);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());

    const adapters = config.adapters;
    expect(adapters).toContain(adapterA);
    expect(adapters).toContain(adapterB);
    expect(adapters?.length).toBe(2);
  });

  it('setAdapter should overwrite adapter with same identifier', async () => {
    const adapterA1 = createAdapter('a');
    const adapterA2 = createAdapter('a');
    configurator.setAdapter(adapterA1).setAdapter(adapterA2);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());

    const adapters = config.adapters;
    expect(adapters).toContain(adapterA2);
    expect(adapters).not.toContain(adapterA1);
    expect(adapters?.length).toBe(1);
  });

  it('setMetadata should set metadata and allow chaining', async () => {
    const metadata = { foo: 'bar' };
    configurator.setMetadata(metadata);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());
    const result = await lastValueFrom(resolveMetadata(config.metadata));
    expect(result).toMatchObject(metadata);
  });

  it('setMetadata should accept a callback', async () => {
    const expected = { foo: 'bar' };
    configurator.setMetadata(async () => expected);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());
    const result = await lastValueFrom(resolveMetadata(config.metadata));
    expect(result).toMatchObject(expected);
  });

  it('setDefaultScope should set defaultScope and allow chaining', async () => {
    const scope = ['user', 'session'];
    configurator.setDefaultScope(scope);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());
    expect(config?.defaultScope).toBe(scope);
  });

  it('setParent should set parent and allow chaining', async () => {
    const parent: ITelemetryProvider = {} as ITelemetryProvider;
    const result = configurator.setParent(parent);
    expect(result).toBe(configurator);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());
    expect(config?.parent).toBe(parent);
  });

  it('setParent should accept undefined to remove parent', async () => {
    configurator.setParent(undefined);

    const config = await configurator.createConfigAsync(createConfigCallbackArgs());
    expect(config?.parent).toBe(undefined);
  });
});
