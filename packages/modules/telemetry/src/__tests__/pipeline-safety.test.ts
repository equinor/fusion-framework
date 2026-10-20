import { afterEach, describe, expect, it, vi } from 'vitest';
import { NEVER, Subject, of, throwError } from 'rxjs';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { BaseTelemetryAdapter } from '../TelemetryAdapter.js';
import { TelemetryConfigurator } from '../TelemetryConfigurator.js';
import { createOperationalRecords } from '../utils/create-operational-records.js';
import { diagnosticContext } from '../schemas/diagnostic-context.js';
import type { TelemetryItem } from '../types.js';

afterEach(() => {
  vi.useRealTimers();
  vi.restoreAllMocks();
});

/**
 * Settles a provider operation while timers are faked: outcomes are flow actions delivered
 * on the async scheduler, so pending timers must be advanced.
 */
async function settle<T>(operation: Promise<T>): Promise<T> {
  let settled = false;
  operation.then(
    () => {
      settled = true;
    },
    () => {
      settled = true;
    },
  );
  // Each step may schedule the next outcome; advance in 1 ms steps, since zero-length advances
  // do not fire scheduler work queued from inside another scheduled callback.
  for (let step = 0; step < 20 && !settled; step++) {
    await vi.advanceTimersByTimeAsync(1);
  }
  return operation;
}

/** Creates a safe record without dependencies on a host runtime. */
function record(): TelemetryItem {
  return createOperationalRecords({
    source: { source: 'widget', hostId: 'host' },
    module: 'http',
    operation: 'request',
    outcome: 'success',
    duration: 0,
  })[0];
}

describe('telemetry pipeline failure isolation', () => {
  it.each(['widgetKey', 'widgetVersion'])('rejects removed widget identity field %s', (field) => {
    const result = diagnosticContext.safeParse({
      ...record().diagnostic,
      [field]: 'widget-manifest-sentinel',
    });
    expect(result.success).toBe(false);
  });

  it('emits unclassified records without assuming a host kind', () => {
    const [metric] = createOperationalRecords({
      source: { hostId: 'host', hostName: 'custom-shell', hostVersion: '1.2.3' },
      module: 'host',
      operation: 'initialize',
      outcome: 'success',
      duration: 0,
    });
    expect(diagnosticContext.safeParse(metric.diagnostic).success).toBe(true);
    expect(metric.diagnostic).not.toHaveProperty('source');
    expect(metric.diagnostic).toMatchObject({ hostName: 'custom-shell', hostVersion: '1.2.3' });
    expect(metric.scope).toEqual(['operational']);
  });

  it.each(['appKey', 'appVersion'])(
    'rejects host-specific field %s in the generic envelope',
    (field) => {
      const result = diagnosticContext.safeParse({ ...record().diagnostic, [field]: 'value' });
      expect(result.success).toBe(false);
    },
  );

  it('accepts host-defined source kinds beyond the built-in hosts', () => {
    const [metric] = createOperationalRecords({
      source: { source: 'portal-shell', hostId: 'host' },
      module: 'host',
      operation: 'initialize',
      outcome: 'success',
      duration: 0,
    });
    expect(diagnosticContext.safeParse(metric.diagnostic).success).toBe(true);
    expect(metric).toMatchObject({ scope: ['portal-shell', 'operational'] });
    expect(() =>
      new TelemetryConfigurator().setSource({ source: 'portal-shell', hostId: 'host' }),
    ).not.toThrow();
  });

  it.each(['', 'Portal', 'https://example.com/user', 'user name', 'a/b'])(
    'rejects source kind %j that could carry dynamic data',
    (source) => {
      expect(() =>
        createOperationalRecords({
          source: { source, hostId: 'host' },
          module: 'host',
          operation: 'initialize',
          outcome: 'success',
          duration: 0,
        }),
      ).toThrow(RangeError);
      expect(diagnosticContext.safeParse({ ...record().diagnostic, source }).success).toBe(false);
      expect(() => new TelemetryConfigurator().setSource({ source, hostId: 'host' })).toThrow(
        RangeError,
      );
    },
  );

  it('shares initialization even when an adapter calls back into the provider synchronously', async () => {
    let provider: TelemetryProvider;
    const initialize = vi.fn(async () => {
      void provider.initialize();
    });
    provider = new TelemetryProvider({ adapters: { test: { initialize, processItem: vi.fn() } } });
    const first = provider.initialize();
    expect(provider.initialize()).toBe(first);
    await first;
    expect(initialize).toHaveBeenCalledTimes(1);
    await provider.dispose();
  });

  it('does not let one saturated asynchronous exporter starve a healthy sibling', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let release = (): void => {};
    const pending = new Promise<void>((resolve) => {
      release = resolve;
    });
    const slow = vi.fn(() => pending);
    const healthy = vi.fn();
    const provider = new TelemetryProvider({
      adapters: {
        slow: { initialize: vi.fn(), processItem: slow },
        healthy: { initialize: vi.fn(), processItem: healthy },
      },
    });
    await provider.initialize();
    for (let index = 0; index < 257; index++) provider.track(record());
    expect(slow).toHaveBeenCalledTimes(256);
    expect(healthy).toHaveBeenCalledTimes(257);
    release();
    await provider.dispose();
  });

  it.each(['throw', 'reject'])(
    'isolates an adapter initialize %s and starts all adapters',
    async (mode) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const healthy = { initialize: vi.fn(), processItem: vi.fn() };
      const provider = new TelemetryProvider({
        adapters: {
          broken: {
            initialize: () => {
              if (mode === 'throw') throw new Error('secret');
              return Promise.reject(new Error('secret'));
            },
            processItem: vi.fn(),
          },
          healthy,
        },
      });
      await expect(provider.initialize()).resolves.toBeUndefined();
      await provider.initialize();
      expect(healthy.initialize).toHaveBeenCalledTimes(1);
      provider.track(record());
      expect(healthy.processItem).toHaveBeenCalledTimes(1);
      await provider.dispose();
    },
  );

  it.each(['throw', 'reject'])(
    'isolates an adapter process %s without recursive export',
    async (mode) => {
      const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const healthy = { initialize: vi.fn(), processItem: vi.fn() };
      const broken = {
        initialize: vi.fn(),
        processItem: vi.fn(() => {
          if (mode === 'throw') throw new Error('secret');
          return Promise.reject(new Error('secret'));
        }),
      };
      const provider = new TelemetryProvider({ adapters: { broken, healthy } });
      await provider.initialize();
      provider.track(record());
      provider.track(record());
      await vi.waitFor(() => expect(warning).toHaveBeenCalledTimes(1));
      expect(healthy.processItem).toHaveBeenCalledTimes(2);
      expect(broken.processItem).toHaveBeenCalledTimes(2);
      expect(JSON.stringify(warning.mock.calls)).not.toContain('secret');
      await provider.dispose();
    },
  );

  it('propagates asynchronous processing failures from base adapters', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    class AsyncAdapter extends BaseTelemetryAdapter {
      /** Deliberately rejects to verify the base adapter preserves the processing promise. */
      protected override async _processItem(): Promise<void> {
        throw new Error('controlled failure');
      }
    }
    const provider = new TelemetryProvider({ adapters: { async: new AsyncAdapter() } });
    await provider.initialize();
    provider.track(record());
    await provider.dispose();
    expect(console.warn).toHaveBeenCalled();
  });

  it('owns delayed metadata subscriptions and emits nothing after disposal', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const metadata = new Subject<Record<string, unknown>>();
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      metadata,
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await settle(provider.initialize());
    provider.track(record());
    expect(metadata.observed).toBe(true);
    const disposal = provider.dispose();
    // Built-in enrichment drains at its deadline; the disposal outcome follows on the scheduler.
    await vi.advanceTimersByTimeAsync(1_000);
    await settle(disposal);
    expect(metadata.observed).toBe(false);
    expect(processItem).toHaveBeenCalledTimes(1);
    metadata.next({});
    provider.track(record());
    expect(processItem).toHaveBeenCalledTimes(1);
    await expect(provider.initialize()).rejects.toThrow('disposed');
  });

  it('cancels unbounded custom metadata without waiting for it during disposal', async () => {
    const metadata = new Subject<Record<string, unknown>>();
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      metadata,
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    provider.trackEvent({ name: 'custom' });
    expect(metadata.observed).toBe(true);
    await provider.dispose();
    expect(metadata.observed).toBe(false);
    expect(processItem).not.toHaveBeenCalled();
  });

  it.each([
    () => throwError(() => new Error('secret')),
    () => {
      throw new Error('secret');
    },
    () => of({ secret: 'sentinel', fusion: { type: 'framework', app: { key: 'wrong' } } }),
  ])('keeps built-in records safe through metadata resolution', async (metadata) => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      metadata,
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await provider.initialize();
    provider.track(record());
    expect(processItem).toHaveBeenCalledTimes(1);
    const [item] = processItem.mock.calls[0];
    expect(item.diagnostic.source).toBe('widget');
    expect(item.diagnostic.hostId).toBe('host');
    expect(JSON.stringify(item)).not.toContain('sentinel');
    expect(item.metadata).toBeUndefined();
    await provider.dispose();
  });

  it('snapshots built-in fields before metadata and prevents an adapter from rewriting sibling delivery', async () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const healthy = vi.fn();
    const provider = new TelemetryProvider({
      metadata: ({ item }) => {
        if (item.diagnostic) item.diagnostic.hostId = 'sentinel';
        item.scope.push('sentinel');
        item.properties = { token: 'sentinel' };
        return {};
      },
      defaultScope: ['sentinel'],
      adapters: {
        mutating: {
          initialize: vi.fn(),
          processItem: (item) => {
            if (item.diagnostic) item.diagnostic.source = 'framework';
          },
        },
        healthy: { initialize: vi.fn(), processItem: healthy },
      },
    });
    await provider.initialize();
    provider.track(record());
    expect(healthy).toHaveBeenCalledTimes(1);
    expect(healthy.mock.calls[0][0].diagnostic).toMatchObject({
      hostId: 'host',
      source: 'widget',
    });
    expect(JSON.stringify(healthy.mock.calls)).not.toContain('sentinel');
    await provider.dispose();
  });

  it('bounds pending built-in metadata and reports timeout without blocking the operation', async () => {
    vi.useFakeTimers();
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    const processItem = vi.fn();
    const provider = new TelemetryProvider({
      metadata: NEVER,
      adapters: { test: { initialize: vi.fn(), processItem } },
    });
    await settle(provider.initialize());
    for (let index = 0; index < 257; index++) provider.track(record());
    expect(processItem).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(processItem).toHaveBeenCalledTimes(257);
    await settle(provider.dispose());
  });

  it('waits for supported async processing before adapter shutdown', async () => {
    let finish: (() => void) | undefined;
    const shutdown = vi.fn();
    const provider = new TelemetryProvider({
      adapters: {
        async: {
          initialize: vi.fn(),
          processItem: () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
          shutdown,
        },
      },
    });
    await provider.initialize();
    provider.track(record());
    const disposal = provider.dispose();
    await Promise.resolve();
    expect(shutdown).not.toHaveBeenCalled();
    finish?.();
    await disposal;
    expect(shutdown).toHaveBeenCalledTimes(1);
  });
});
