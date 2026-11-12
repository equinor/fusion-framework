import { afterEach, describe, expect, it, vi } from 'vitest';
import { config as rxjsConfig, firstValueFrom, lastValueFrom, Observable, of, Subject } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import eventModule, { type EventModule } from '@equinor/fusion-framework-module-event';
import {
  enableTelemetry,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { ContextProvider } from '../ContextProvider';
import type { ContextModuleConfig } from '../ContextModuleConfig';
import type { ContextItem } from '../types';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

const item = (id: string, type = 'ProjectMaster'): ContextItem =>
  ({ id: `${id}-${SENTINEL}`, title: SENTINEL, type: { id: type }, value: { SENTINEL } }) as never;

/** A real event bus and host telemetry, with records observed at the exported boundary. */
const setup = async (overrides: Partial<ContextModuleConfig> = {}, withTelemetry = true) => {
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  config.addConfig({ module: eventModule });
  enableTelemetry(config, {
    configure: (builder) => {
      builder.setSource({ source: 'app', hostId: 'host' });
      builder.setAdapter('test', { initialize: vi.fn(), processItem });
    },
  });
  const modules = await config.initialize<[EventModule, TelemetryModule]>();
  const provider = new ContextProvider({
    config: {
      client: {
        get: { client: { fn: vi.fn() }, key: () => 'get' },
        query: { client: { fn: vi.fn() }, key: () => 'query' },
      },
      ...overrides,
    } as ContextModuleConfig,
    event: modules.event,
  });
  if (withTelemetry) {
    await provider.connectTelemetry(modules.telemetry);
  }
  const records = () =>
    processItem.mock.calls
      .map(([record]) => record)
      .filter((record) => record.diagnostic?.module === 'context');
  const summary = () =>
    records().map((record) => [record.name, record.diagnostic?.outcome, record.properties?.reason]);
  return { modules, provider, processItem, records, summary };
};

describe('context operational telemetry', () => {
  it('measures a resolver observable created before telemetry connects per subscription', async () => {
    const resolved = item('resolved');
    const { modules, provider, summary } = await setup(
      { resolveContext: () => of(resolved) },
      false,
    );
    const result$ = provider.resolveContext(item('a'));

    await provider.connectTelemetry(modules.telemetry);
    await expect(lastValueFrom(result$)).resolves.toBe(resolved);
    await expect(lastValueFrom(result$)).resolves.toBe(resolved);
    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'success', undefined],
      ['fusion.context.resolve.duration', 'success', undefined],
    ]);
    provider.dispose();
    await modules.dispose();
  });

  it('measures validation, resolution and selection without exporting context data', async () => {
    const { modules, provider, processItem, summary, records } = await setup({
      validateContext: (context) => context?.type.id === 'ProjectMaster',
      resolveContext: () => of(item('resolved')),
    });
    const result = await provider.setCurrentContextAsync(item('contract', 'Contract'), {
      validate: true,
      resolve: true,
    });
    expect(result.id).toBe(`resolved-${SENTINEL}`);
    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'success', undefined],
      ['fusion.context.select.duration', 'success', undefined],
    ]);
    expect(records()[1].properties).toEqual({ clear: false, validate: true, resolve: true });
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    provider.dispose();
    await modules.dispose();
  });

  it('distinguishes a validation failure from a listener cancellation', async () => {
    const { modules, provider, summary } = await setup({
      validateContext: () => false,
      resolveContext: () => of(item('resolved')),
    });
    await expect(
      provider.setCurrentContextAsync(item('a'), { validate: true, resolve: false }),
    ).rejects.toThrow('failed to validate provided context');

    const remove = modules.event.addEventListener('onSetContextResolve', (event) =>
      event.preventDefault(),
    );
    await expect(
      provider.setCurrentContextAsync(item('b'), { validate: true, resolve: true }),
    ).rejects.toThrow('resolving of context was canceled');
    remove();

    expect(summary()).toEqual([
      ['fusion.context.select.duration', 'failure', 'validation'],
      ['fusion.context.select.failure', 'failure', 'validation'],
      ['fusion.context.select.duration', 'cancelled', 'listener'],
    ]);
    provider.dispose();
    await modules.dispose();
  });

  it('records superseded tasks as cancelled and skips unchanged selections', async () => {
    const gate = new Subject<ContextItem>();
    const { modules, provider, summary } = await setup({
      validateContext: (context) => context?.type.id === 'ProjectMaster',
      resolveContext: () => gate,
    });
    const first = provider.setCurrentContext(item('slow', 'Contract'), {
      validate: true,
      resolve: true,
    });
    const settled = lastValueFrom(first, { defaultValue: null });
    await vi.waitFor(() => expect(gate.observed).toBe(true));
    const next = item('fast');
    await provider.setCurrentContextAsync(next);
    await settled;
    // Setting the same item again is skipped work and emits nothing. It settles before a
    // late subscriber attaches, so it is issued without awaiting its (empty) result.
    provider.setCurrentContext(next).subscribe({ error: () => undefined });

    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'cancelled', undefined],
      ['fusion.context.select.duration', 'cancelled', undefined],
      ['fusion.context.select.duration', 'success', undefined],
    ]);
    provider.dispose();
    await modules.dispose();
  });

  it('cancels in-flight work on disposal and emits nothing afterwards', async () => {
    const gate = new Subject<ContextItem>();
    const { modules, provider, records, summary } = await setup({
      validateContext: () => false,
      resolveContext: () => gate,
    });
    provider.setCurrentContext(item('slow'), { validate: true, resolve: true }).subscribe({
      error: () => undefined,
    });
    await vi.waitFor(() => expect(gate.observed).toBe(true));
    provider.dispose();
    expect(summary()).toEqual(
      expect.arrayContaining([['fusion.context.select.duration', 'cancelled', 'disposed']]),
    );
    const count = records().length;
    gate.next(item('late'));
    await provider.connectTelemetry(modules.telemetry);
    expect(records()).toHaveLength(count);
    await modules.dispose();
  });

  it('measures direct resolver calls, including configured overrides, once each', async () => {
    const { modules, provider, summary, records } = await setup({
      resolveContext: () => of(item('resolved')),
    });
    await expect(provider.resolveContextAsync(item('a'))).resolves.toMatchObject({
      title: SENTINEL,
    });
    await lastValueFrom(provider.resolveContext(item('b')));
    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'success', undefined],
      ['fusion.context.resolve.duration', 'success', undefined],
    ]);
    expect(records()[0].properties).toEqual({ by: 'item' });
    provider.dispose();
    await modules.dispose();
  });

  it('records a synchronous resolver factory throw and rethrows the same error', async () => {
    const original = new Error(SENTINEL);
    const { modules, provider, summary, processItem } = await setup({
      resolveContext: () => {
        throw original;
      },
    });
    let caught: unknown;
    try {
      provider.resolveContext(item('sync-throw'));
    } catch (error) {
      caught = error;
    }

    expect(caught).toBe(original);
    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'failure', undefined],
      ['fusion.context.resolve.failure', 'failure', undefined],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    provider.dispose();
    await modules.dispose();
  });

  it('stops a synchronous resolver after firstValueFrom receives its result', async () => {
    const continued = vi.fn();
    const resolved = item('resolved');
    const { modules, provider, summary } = await setup({
      resolveContext: () =>
        new Observable((subscriber) => {
          subscriber.next(resolved);
          if (!subscriber.closed) {
            continued();
            subscriber.error(new Error(SENTINEL));
          }
        }),
    });
    await expect(firstValueFrom(provider.resolveContext(item('a')))).resolves.toBe(resolved);
    expect(continued).not.toHaveBeenCalled();
    expect(summary()).toEqual([['fusion.context.resolve.duration', 'success', undefined]]);
    provider.dispose();
    await modules.dispose();
  });

  it('records a final change-event veto without changing the detached business error path', async () => {
    const { modules, provider, summary, processItem } = await setup();
    const previousHandler = rxjsConfig.onUnhandledError;
    const detachedError = vi.fn();
    const result = vi.fn();
    const callerError = vi.fn();
    rxjsConfig.onUnhandledError = detachedError;
    const remove = modules.event.addEventListener('onCurrentContextChange', (event) =>
      event.preventDefault(),
    );
    const pending = provider.setCurrentContext(item('vetoed')).subscribe({
      next: result,
      error: callerError,
    });
    try {
      await vi.waitFor(() => expect(detachedError).toHaveBeenCalledTimes(1));
      expect(summary()).toEqual([['fusion.context.select.duration', 'cancelled', 'listener']]);
      expect(result).not.toHaveBeenCalled();
      expect(callerError).not.toHaveBeenCalled();
      expect(provider.currentContext).toBeUndefined();
      expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
      pending.unsubscribe();
      provider.dispose();
      expect(summary()).toHaveLength(1);
    } finally {
      remove();
      pending.unsubscribe();
      provider.dispose();
      rxjsConfig.onUnhandledError = previousHandler;
      await modules.dispose();
    }
  });

  it('measures the lookup behind setCurrentContextById, including its failure', async () => {
    const lookup = vi.fn<(args: { id: string }) => Promise<ContextItem>>();
    const { modules, provider, summary, records, processItem } = await setup({
      client: {
        get: { client: { fn: lookup }, key: ({ id }: { id: string }) => id },
        query: { client: { fn: vi.fn() }, key: () => 'query' },
      } as never,
    });
    lookup.mockResolvedValueOnce(item('found'));
    await provider.setCurrentContextByIdAsync('found');
    lookup.mockRejectedValueOnce(new Error(SENTINEL));
    await expect(provider.setCurrentContextByIdAsync('missing')).rejects.toBeDefined();
    expect(summary()).toEqual([
      ['fusion.context.resolve.duration', 'success', undefined],
      ['fusion.context.select.duration', 'success', undefined],
      ['fusion.context.resolve.duration', 'failure', undefined],
      ['fusion.context.resolve.failure', 'failure', undefined],
    ]);
    expect(records()[0].properties).toEqual({ by: 'id' });
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    provider.dispose();
    await modules.dispose();
  });

  it('keeps context selection unchanged when telemetry throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const { modules, provider } = await setup();
    await provider.connectTelemetry({
      source: { source: 'app', hostId: 'host' },
      track: () => {
        throw new Error('collector down');
      },
    } as never);
    await expect(provider.setCurrentContextAsync(item('a'))).resolves.toMatchObject({
      title: SENTINEL,
    });
    await expect(provider.setCurrentContextAsync(item('b'))).resolves.toBeDefined();
    expect(warn).toHaveBeenCalledTimes(1);
    provider.dispose();
    await modules.dispose();
  });
});
