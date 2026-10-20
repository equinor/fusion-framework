import { describe, expect, it, vi } from 'vitest';
import { Subject } from 'rxjs';
import { ModulesConfigurator, type ModuleEvent } from '@equinor/fusion-framework-module';
import { TelemetryProvider } from '../TelemetryProvider.js';
import { enableTelemetry } from '../enable-telemetry.js';
import { StartupCapture } from '../lib/StartupCapture.js';
import { TelemetryConfigurator } from '../TelemetryConfigurator.js';
import type { ITelemetryConfigurator } from '../TelemetryConfigurator.interface.js';
import { mapConfiguratorEvents } from '../utils/map-configurator-events.js';
import type { TelemetryItem } from '../types.js';
import { TelemetryLevel, TelemetryType } from '../static.js';
import { module as telemetryModule, type TelemetryModule } from '../module.js';
import type { TelemetrySource } from '../schemas/diagnostic-context.js';

const source: TelemetrySource = { source: 'app', hostId: 'app-host', hostName: 'example' };

/** Creates a module whose own lifecycle does not depend on telemetry. */
function fakeModule(name: string): {
  name: string;
  initialize: () => { version: string };
  dispose: () => void;
} {
  return { name, initialize: () => ({ version: '1.0.0' }), dispose: vi.fn() };
}

describe('safe lifecycle capture', () => {
  it('uses a structurally compatible prepared configurator without requiring the built-in class', async () => {
    const processItem = vi.fn();
    const custom: ITelemetryConfigurator = {
      createConfigAsync: vi.fn(async () => ({
        source,
        adapters: { test: { initialize: vi.fn(), processItem } },
      })),
      attachLifecycleItems: vi.fn(() => custom),
      hasLifecycleItems: vi.fn(() => false),
      setSource: vi.fn(() => custom),
      setParent: vi.fn(() => custom),
      configureAdapter: vi.fn(() => custom),
      setAdapter: vi.fn(() => custom),
      setMetadata: vi.fn(() => custom),
      setDefaultScope: vi.fn(() => custom),
      attachItems: vi.fn(() => custom),
      setFilter: vi.fn(() => custom),
    };
    const config = new ModulesConfigurator();
    config.addConfig({ module: telemetryModule, configurator: custom });
    enableTelemetry(config, {
      attachConfiguratorEvents: true,
      configure: (builder) => {
        expect(builder).toBe(custom);
        builder.setDefaultScope(['custom']);
      },
    });
    expect(custom).not.toBeInstanceOf(TelemetryConfigurator);
    expect(custom.attachLifecycleItems).toHaveBeenCalledOnce();
    const modules = await config.initialize<[TelemetryModule]>();
    expect(custom.createConfigAsync).toHaveBeenCalledOnce();
    expect(custom.setDefaultScope).toHaveBeenCalledWith(['custom']);
    modules.telemetry.trackEvent({
      name: 'custom',
      level: TelemetryLevel.Information,
      scope: [],
    });
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledOnce());
    await modules.dispose();
  });

  it('recovers a host startup failure to the parent without claiming exporter ownership', async () => {
    const host = new ModulesConfigurator();
    const fallback = vi.fn();
    const normal = vi.fn();
    const parent = new TelemetryProvider({
      adapters: {
        fallback: { fallback: true, initialize: vi.fn(), processItem: fallback },
        normal: { initialize: vi.fn(), processItem: normal },
      },
    });
    await parent.initialize();
    const capture = new StartupCapture(host, { source, parent });
    host.addConfig({
      module: telemetryModule,
      prepare: (builder) =>
        builder
          .setSource(source)
          .setParent(parent)
          .attachLifecycleItems(capture.items)
          // The child's exporters are not configured yet when the host fails.
          .setAdapter('owned', { initialize: vi.fn(), processItem: vi.fn() }),
    });
    // The host's capture is kept; enabling again must not replace it.
    enableTelemetry(host, { attachConfiguratorEvents: true });
    capture.fail();
    expect(normal).toHaveBeenCalledTimes(2);
    expect(normal.mock.calls.map(([item]) => item.diagnostic)).toEqual([
      expect.objectContaining(source),
      expect.objectContaining(source),
    ]);
    // Accepted trade-off: before a provider exists, ownership is unknown, so fallbacks also receive.
    expect(fallback).toHaveBeenCalledTimes(2);
    capture.fail();
    expect(normal).toHaveBeenCalledTimes(2);
    await parent.dispose();
  });

  it.each([true, false])('preserves custom streams with lifecycle capture %s', async (enabled) => {
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const config = new ModulesConfigurator();
    const custom = new Subject<TelemetryItem>();
    const processItem = vi.fn();
    enableTelemetry(config, {
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.attachItems(custom);
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    enableTelemetry(config, { attachConfiguratorEvents: enabled });
    const modules = await config.initialize<[TelemetryModule]>();
    expect(processItem).toHaveBeenCalledTimes(enabled ? 2 : 0);
    custom.next({
      type: TelemetryType.Event,
      name: 'custom',
      level: TelemetryLevel.Information,
      scope: [],
    });
    await vi.waitFor(() => expect(processItem).toHaveBeenCalledTimes(enabled ? 3 : 1));
    expect(processItem.mock.calls.at(-1)?.[0].name).toBe('custom');
    if (enabled) {
      custom.error(new Error('private-stream-sentinel'));
      expect(warning).toHaveBeenCalledWith('Initial telemetry stream failed');
    }
    await modules.dispose();
    expect(custom.observed).toBe(false);
    expect(
      processItem.mock.calls.filter(([item]) => item.name === 'fusion.host.dispose.duration'),
    ).toHaveLength(enabled ? 1 : 0);
    expect(JSON.stringify(processItem.mock.calls)).not.toContain('private-stream-sentinel');
    warning.mockRestore();
  });

  it('makes opt-out stop lifecycle records reaching the provider, while the host still reports a failed startup', async () => {
    const processItem = vi.fn();
    const parentItems = vi.fn();
    const parent = new TelemetryProvider({
      adapters: { parent: { initialize: vi.fn(), processItem: parentItems } },
    });
    await parent.initialize();
    const host = new ModulesConfigurator();
    const capture = new StartupCapture(host, { source, parent });
    host.addConfig({
      module: telemetryModule,
      prepare: (builder) => builder.setSource(source).attachLifecycleItems(capture.items),
    });
    enableTelemetry(host, {
      attachConfiguratorEvents: false,
      configure: (builder) => {
        builder.setAdapter('test', { initialize: vi.fn(), processItem });
      },
    });
    // The opt-out is the last word; enabling again does not reattach a capture.
    enableTelemetry(host, { attachConfiguratorEvents: true });
    const modules = await host.initialize<[TelemetryModule]>();
    expect(processItem).not.toHaveBeenCalled();
    await modules.dispose();

    const failing = new ModulesConfigurator();
    const failingCapture = new StartupCapture(failing, { source, parent });
    enableTelemetry(failing, { attachConfiguratorEvents: false });
    failingCapture.fail();
    expect(parentItems.mock.calls.map(([item]) => item.name)).toEqual([
      'fusion.host.initialize.duration',
      'fusion.host.initialize.failure',
    ]);
    await parent.dispose();
  });

  it('keeps a usable pipeline attached through cleanup after a late startup failure', async () => {
    const processItem = vi.fn();
    const shutdown = vi.fn();
    const config = new ModulesConfigurator();
    enableTelemetry(config, {
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setSource(source);
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
        configure: (builder) => {
          builder.setSource(source);
          builder.setParent(parent);
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
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setSource(source);
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
    new StartupCapture({ event$: events }, { source, parent });
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
    // The host owns its capture and the parent it recovers to.
    const capture = new StartupCapture(config, { source, parent });
    config.addConfig({
      module: telemetryModule,
      prepare: (builder) =>
        builder.setSource(source).setParent(parent).attachLifecycleItems(capture.items),
    });
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
    const capture = new StartupCapture({ event$: events }, { source });
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
      attachConfiguratorEvents: true,
      configure: (builder) => {
        builder.setSource({ source: 'widget', hostId: 'widget-host' });
        builder.setParent(app);
      },
    });
    const widget = await config.initialize<[TelemetryModule]>();
    await vi.waitFor(() => expect(normal.processItem).toHaveBeenCalledTimes(2));
    expect(explicit.processItem).toHaveBeenCalledTimes(2);
    expect(rootAdapter.processItem).not.toHaveBeenCalled();
    expect(normal.processItem.mock.calls[1][0]).toMatchObject({
      name: 'fusion.host.initialize.duration',
      diagnostic: { source: 'widget', hostId: 'widget-host' },
    });
    expect(JSON.stringify(normal.processItem.mock.calls)).not.toContain('sentinel');
    await widget.dispose();
    await app.dispose();
    await root.dispose();
  });
});
