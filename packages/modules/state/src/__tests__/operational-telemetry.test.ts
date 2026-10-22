import { afterEach, describe, expect, it, vi } from 'vitest';
import { merge, Subject, type Observable } from 'rxjs';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import {
  enableTelemetry,
  type TelemetryItem,
  type TelemetryModule,
} from '@equinor/fusion-framework-module-telemetry';

import { StateProvider } from '../StateProvider.js';
import type { StateModuleConfig } from '../StateModuleConfig.js';
import { StateSyncEvent, type StateEventType } from '../events/index.js';
import { module as stateModule } from '../module.js';
import { MockStorage } from './storage.mock.js';

const SENTINEL = 'sentinel-secret';

afterEach(() => vi.restoreAllMocks());

/** In-memory storage that can also emit synchronization events. */
class SyncingStorage extends MockStorage {
  readonly sync = new Subject<StateEventType>();
  get events$(): Observable<StateEventType> {
    return merge(super.events$, this.sync);
  }
}

/** Real host telemetry with an explicit adapter, observed at the exported record boundary. */
const setup = async () => {
  const config = new ModulesConfigurator();
  const processItem = vi.fn<(item: TelemetryItem) => void>();
  enableTelemetry(config, {
    configure: (builder) => {
      builder.setSource({ source: 'app', hostId: 'host' });
      builder.setAdapter('test', { initialize: vi.fn(), processItem });
    },
  });
  const modules = await config.initialize<[TelemetryModule]>();
  const storage = new SyncingStorage();
  const provider = new StateProvider({ storage } as unknown as StateModuleConfig);
  await provider.initialize();
  provider.connectTelemetry(modules.telemetry);
  const records = () =>
    processItem.mock.calls
      .map(([item]) => item)
      .filter((item) => item.diagnostic?.module === 'state');
  const summary = () =>
    records().map((item) => [item.name, item.diagnostic?.outcome, item.properties]);
  return { modules, storage, provider, processItem, records, summary };
};

describe('state operational telemetry', () => {
  it('records one outcome per operation with counts but no keys or values', async () => {
    const { modules, provider, processItem, summary } = await setup();
    await provider.storeItem({ key: SENTINEL, value: SENTINEL });
    await provider.storeItems([
      { key: `${SENTINEL}-1`, value: 1 },
      { key: `${SENTINEL}-2`, value: 2 },
    ]);
    await expect(provider.getItem(SENTINEL)).resolves.toMatchObject({ value: SENTINEL });
    await provider.getAllItems({ prefix: SENTINEL });
    await provider.removeItems([SENTINEL]);

    expect(summary()).toEqual([
      ['fusion.state.store.duration', 'success', { count: 1 }],
      ['fusion.state.store.duration', 'success', { count: 2 }],
      ['fusion.state.get.duration', 'success', undefined],
      ['fusion.state.list.duration', 'success', undefined],
      ['fusion.state.remove.duration', 'success', { count: 1 }],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    provider.dispose();
    await modules.dispose();
  });

  it('reports rejected and error-result persistence as failures while callers see the original', async () => {
    const { modules, storage, provider, processItem, summary } = await setup();
    const original = new Error(SENTINEL);
    vi.spyOn(storage, 'putItem').mockRejectedValueOnce(original);
    await expect(provider.storeItem({ key: 'a', value: 1 })).rejects.toBe(original);

    const errorResult = { status: 'error', key: SENTINEL, error: original } as never;
    vi.spyOn(storage, 'removeItem').mockResolvedValueOnce(errorResult);
    await expect(provider.removeItem('a')).resolves.toBe(errorResult);

    // A synchronous throw stays synchronous for the caller.
    vi.spyOn(storage, 'item').mockImplementationOnce(() => {
      throw original;
    });
    expect(() => provider.getItem('a')).toThrow(original);

    expect(summary()).toEqual([
      ['fusion.state.store.duration', 'failure', { count: 1 }],
      ['fusion.state.store.failure', 'failure', { count: 1 }],
      ['fusion.state.remove.duration', 'failure', { count: 1, reason: 'storage-error', failed: 1 }],
      ['fusion.state.remove.failure', 'failure', { count: 1, reason: 'storage-error', failed: 1 }],
      ['fusion.state.get.duration', 'failure', undefined],
      ['fusion.state.get.failure', 'failure', undefined],
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    provider.dispose();
    await modules.dispose();
  });

  it('summarizes noisy synchronization into bounded status, error and activity records', async () => {
    const { modules, storage, provider, processItem, summary } = await setup();
    storage.sync.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    for (let index = 0; index < 100; index++) {
      storage.sync.next(
        new StateSyncEvent.Poll({ detail: { trigger: 'interval', skipped: index % 2 === 0 } }),
      );
      storage.sync.next(
        new StateSyncEvent.Change({
          detail: { direction: 'pull', change: { docs: [{ secret: SENTINEL }] } as never },
        }),
      );
      storage.sync.next(
        new StateSyncEvent.Error({ detail: { type: 'error', error: new Error(SENTINEL) } }),
      );
    }
    // Repeated identical statuses are not transitions.
    storage.sync.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    storage.sync.next(new StateSyncEvent.Status({ detail: { status: 'paused' } }));
    storage.sync.next(new StateSyncEvent.Poll({ detail: { trigger: 'focus', skipped: false } }));
    provider.dispose();

    expect(summary()).toEqual([
      ['fusion.state.sync-status', 'success', { status: 'active' }],
      ['fusion.state.sync-error', 'failure', { errorType: 'error' }],
      [
        'fusion.state.sync-activity',
        'success',
        { changes: 100, polls: 50, skippedPolls: 50, completions: 0, errors: 100 },
      ],
      ['fusion.state.sync-status', 'success', { status: 'paused' }],
      // The final period is summarized on disposal, then nothing more is emitted.
      [
        'fusion.state.sync-activity',
        'success',
        { changes: 0, polls: 1, skippedPolls: 0, completions: 0, errors: 0 },
      ],
    ]);
    const count = summary().length;
    storage.sync.next(new StateSyncEvent.Status({ detail: { status: 'active' } }));
    expect(summary()).toHaveLength(count);
    expect(storage.sync.observed).toBe(false);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain(SENTINEL);
    await modules.dispose();
  });

  it('keeps state operations unchanged when telemetry is absent or throws', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const storage = new SyncingStorage();
    const plain = new StateProvider({ storage } as unknown as StateModuleConfig);
    await plain.initialize();
    plain.connectTelemetry(undefined);
    await expect(plain.storeItem({ key: 'a', value: 1 })).resolves.toEqual({
      status: 'success',
      key: 'a',
    });
    // Without telemetry, no sync observer subscribes to storage events.
    expect(storage.sync.observed).toBe(false);
    plain.dispose();

    const { modules, provider } = await setup();
    provider.connectTelemetry({
      source: { source: 'app', hostId: 'host' },
      track: () => {
        throw new Error('collector down');
      },
    } as never);
    await expect(provider.storeItem({ key: 'b', value: 2 })).resolves.toMatchObject({
      status: 'success',
    });
    await expect(provider.getItem('b')).resolves.toMatchObject({ value: 2 });
    expect(warn).toHaveBeenCalledTimes(1);
    provider.dispose();
    await modules.dispose();
  });

  it('connects through the module hook and disposes through the module dispose hook', async () => {
    const connectTelemetry = vi.fn();
    const dispose = vi.fn();
    const telemetry = {};
    await stateModule.postInitialize?.({
      instance: { connectTelemetry } as never,
      modules: { telemetry } as never,
    });
    expect(connectTelemetry).toHaveBeenCalledWith(telemetry);
    await stateModule.dispose?.({ instance: { dispose } as never, modules: {} as never });
    expect(dispose).toHaveBeenCalledTimes(1);
  });
});
