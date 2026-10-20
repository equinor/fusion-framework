import { describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { ModulesConfigurator, type ModuleEvent } from '@equinor/fusion-framework-module';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { enableTelemetry } from '../enable-telemetry.js';
import { LifecycleTelemetry } from '../LifecycleTelemetry.js';
import { mapConfiguratorEvents } from '../utils/map-configurator-events.js';
import type { TelemetryItem } from '../types.js';
import type { TelemetryModule } from '../module.js';
import type { TelemetrySource } from '../diagnostic-context.js';

const source: TelemetrySource = { source: 'app', hostId: 'app-host', appKey: 'example' };

/** Creates a module whose own lifecycle does not depend on telemetry. */
function fakeModule(name: string): {
  name: string;
  initialize: () => { version: string };
  dispose: () => void;
} {
  return { name, initialize: () => ({ version: '1.0.0' }), dispose: vi.fn() };
}

describe('safe lifecycle capture', () => {
  it('keeps a usable pipeline attached through cleanup after a late startup failure', async () => {
    const processItem = vi.fn();
    const shutdown = vi.fn();
    const config = new ModulesConfigurator();
    enableTelemetry(config, {
      attachConfiguratorEvents: true,
      source,
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem, shutdown });
      },
    });
    const business = fakeModule('business');
    config.addConfig({ module: business });
    const failure = new Error('sentinel');
    config.addConfig({
      module: {
        name: 'broken',
        initialize: async ({ requireInstance }) => {
          await requireInstance('telemetry');
          throw failure;
        },
      },
    });
    await expect(config.initialize()).rejects.toBe(failure);
    expect(business.dispose).toHaveBeenCalledTimes(1);
    expect(shutdown).toHaveBeenCalledTimes(1);
    expect(processItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fusion.business.dispose.duration',
      }),
    );
    expect(processItem).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'fusion.host.dispose.duration',
      }),
    );
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('sentinel');
  });

  it.each(['factory', 'filter', 'parent', 'optout'] as const)(
    'preserves explicit %s decisions without silently activating fallback',
    async (mode) => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
      const fallback = vi.fn();
      const normal = vi.fn();
      const parent = new TelemetryProvider({
        adapters: {
          fallback: { fallback: true, initialize: vi.fn(), processItem: fallback },
          normal: { initialize: vi.fn(), processItem: normal },
        },
      });
      await parent.initialize();
      const config = new ModulesConfigurator();
      enableTelemetry(config, {
        attachConfiguratorEvents: true,
        parent,
        source,
        configure: (builder) => {
          if (mode === 'factory') {
            builder.configureAdapter('broken', () => {
              throw new Error('sentinel');
            });
          }
          if (mode === 'filter') builder.setFilter({ relay: () => false });
          if (mode === 'parent') builder.setParent(undefined);
        },
      });
      if (mode === 'optout') enableTelemetry(config, { attachConfiguratorEvents: false });
      const modules = await config.initialize<[TelemetryModule]>();
      expect(fallback).not.toHaveBeenCalled();
      await vi.waitFor(() => expect(normal).toHaveBeenCalledTimes(mode === 'factory' ? 2 : 0));
      await modules.dispose();
      await parent.dispose();
      vi.restoreAllMocks();
    },
  );

  it('preserves zero-duration metrics and excludes raw messages, errors and properties', () => {
    const events = new Subject<ModuleEvent>();
    const items: TelemetryItem[] = [];
    const subscription = mapConfiguratorEvents({ event$: events }, source).subscribe((item) =>
      items.push(item),
    );
    events.next({
      name: 'Host::ModuleConfigurator.module.initialized',
      level: 1,
      metric: 0,
      message: 'secret-token',
      properties: { moduleName: 'event', payload: 'secret-body' },
    });
    events.next({
      name: 'Host::ModuleConfigurator.host.initializeError',
      level: 3,
      metric: 0,
      message: 'secret',
      error: new Error('secret-stack'),
      properties: { token: 'secret-token' },
    });
    expect(items).toHaveLength(3);
    expect(items[0]).toMatchObject({ type: 'metric', value: 0 });
    expect(items[2]).toMatchObject({ type: 'exception', exception: { name: 'OperationalError' } });
    expect(JSON.stringify(items)).not.toContain('secret');
    subscription.unsubscribe();
    expect(events.observed).toBe(false);
  });

  it('captures more than 100 early lifecycle events without relying on generic replay', async () => {
    const config = new ModulesConfigurator();
    const processItem = vi.fn();
    enableTelemetry(config, {
      source,
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    for (let index = 0; index < 120; index++) {
      config.addConfig({ module: fakeModule(`test-${index}`) });
    }
    const modules = await config.initialize<[TelemetryModule]>();
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledTimes(122));
    expect(processItem.mock.calls.every(([item]) => item.diagnostic.hostId === 'app-host')).toBe(
      true,
    );
    await modules.dispose();
    const count = processItem.mock.calls.length;
    expect(
      processItem.mock.calls.filter(([item]) => item.name === 'fusion.host.dispose.duration'),
    ).toHaveLength(1);
    await modules.dispose();
    expect(processItem).toHaveBeenCalledTimes(count);
  });

  it('bounds pre-provider queues, preserves failure reporting and reports dropped counts', async () => {
    const events = new Subject<ModuleEvent>();
    const items: TelemetryItem[] = [];
    const parent = new TelemetryProvider({
      adapters: {
        test: {
          initialize: vi.fn(),
          processItem: (item) => {
            items.push(item);
          },
        },
      },
    });
    await parent.initialize();
    new LifecycleTelemetry({ event$: events }, source, parent);
    for (let index = 0; index < 300; index++) {
      events.next({
        name: 'ModuleConfigurator.module.initialized',
        level: 1,
        metric: 0,
        message: 'secret',
        properties: { moduleName: 'event' },
      });
    }
    events.next({
      name: 'ModuleConfigurator.host.initializeError',
      level: 3,
      metric: 0,
      message: 'secret',
      error: new Error('sentinel'),
    });
    expect(items).toHaveLength(256);
    expect(items.some((item) => item.name === 'fusion.host.initialize.failure')).toBe(true);
    expect(items.at(-1)).toMatchObject({ properties: { dropped: 47 } });
    expect(events.observed).toBe(false);
    await parent.dispose();
  });

  it('reports early configuration failure to the parent while preserving the original rejection', async () => {
    const processItem = vi.fn();
    const parent = new TelemetryProvider({
      adapters: { parent: { initialize: vi.fn(), processItem } },
    });
    await parent.initialize();
    const config = new ModulesConfigurator();
    enableTelemetry(config, { attachConfiguratorEvents: true, source, parent });
    const failure = new Error('sentinel');
    config.addConfig({
      module: fakeModule('broken'),
      configure: () => {
        throw failure;
      },
    });
    await expect(config.initialize()).rejects.toBe(failure);
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledTimes(2));
    expect(processItem.mock.calls.map(([item]) => item.name)).toEqual([
      'fusion.host.initialize.duration',
      'fusion.host.initialize.failure',
    ]);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('sentinel');
    await parent.dispose();
  });

  it('stops capture on explicit opt-out and handles a configuration callback failure locally', () => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const events = new Subject<ModuleEvent>();
    const capture = new LifecycleTelemetry({ event$: events }, source);
    capture.fail();
    expect(events.observed).toBe(false);
    expect(warning).toHaveBeenCalledWith(
      'Host initialization failed before telemetry became available',
    );
    capture.fail();
    expect(warning).toHaveBeenCalledTimes(1);
    warning.mockRestore();
  });

  it('keeps explicit exports authoritative across nested origins and asynchronous parent metadata', async () => {
    const rootAdapter = { fallback: true, initialize: vi.fn(), processItem: vi.fn() };
    const normal = { initialize: vi.fn(), processItem: vi.fn() };
    const explicit = { initialize: vi.fn(), processItem: vi.fn() };
    const root = new TelemetryProvider({
      metadata: async () => ({ fusion: { type: 'framework', token: 'sentinel' } }),
      adapters: { rootAdapter, normal },
    });
    await root.initialize();
    const app = new TelemetryProvider({ adapters: { explicit }, metadata: {} });
    await app.initialize({ parent: root });
    const config = new ModulesConfigurator();
    enableTelemetry(config, {
      source: { source: 'widget', hostId: 'widget-host', widgetKey: 'widget' },
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setParent(app);
      },
    });
    const widget = await config.initialize<[TelemetryModule]>();
    await vi.waitFor(() => expect(normal.processItem).toHaveBeenCalledTimes(2));
    expect(explicit.processItem).toHaveBeenCalledTimes(2);
    expect(rootAdapter.processItem).not.toHaveBeenCalled();
    expect(normal.processItem.mock.calls[1][0]).toMatchObject({
      name: 'fusion.host.initialize.duration',
      diagnostic: { source: 'widget', hostId: 'widget-host', widgetKey: 'widget' },
    });
    expect(JSON.stringify(normal.processItem.mock.calls)).not.toContain('sentinel');
    await widget.dispose();
    await app.dispose();
    await root.dispose();
  });
});
