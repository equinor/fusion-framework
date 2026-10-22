import { describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator } from '../lib/configurator/ModulesConfigurator.js';
import { telemetryExportRequest } from '../utils/telemetry-export-request.js';
import { markTelemetryExportRequest } from '../utils/mark-telemetry-export-request.js';
import { ModuleEventLevel, type ModuleEvent } from '../types.js';
import { ModuleConfiguratorEventName } from '../lib/configurator/module-configurator-event-name.js';

describe('diagnostic lifecycle ownership', () => {
  it('does not dispose providers owned by an earlier initialization attempt', async () => {
    const config = new ModulesConfigurator();
    const provider = {};
    const failure = new Error('later attempt failed');
    const dispose = vi.fn();
    config.addConfig({
      module: {
        name: 'resource',
        initialize: vi
          .fn<() => Promise<object>>()
          .mockResolvedValueOnce(provider)
          .mockRejectedValueOnce(failure),
        dispose,
      },
    });

    const modules = await config.initialize();
    await expect(config.initialize()).rejects.toBe(failure);
    expect(dispose).not.toHaveBeenCalled();

    await modules.dispose();
    expect(dispose).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ instance: provider }),
    );
  });

  it('cleans up early and late successful providers after another initializer fails', async () => {
    const config = new ModulesConfigurator();
    const early = vi.fn();
    const late = vi.fn();
    const failure = new Error('original');
    config.addConfig({ module: { name: 'early', initialize: () => ({}), dispose: early } });
    config.addConfig({
      module: {
        name: 'late',
        initialize: async () => {
          await new Promise((resolve) => setTimeout(resolve, 1));
          return {};
        },
        dispose: late,
      },
    });
    config.addConfig({
      module: {
        name: 'broken',
        initialize: async () => {
          await Promise.resolve();
          throw failure;
        },
      },
    });
    await expect(config.initialize()).rejects.toBe(failure);
    expect(early).toHaveBeenCalledTimes(1);
    // Late providers are cleaned up after startup has already rejected.
    await vi.waitFor(() => expect(late).toHaveBeenCalledTimes(1));
  });

  it('rejects on the first failure even when a sibling initializer never settles', async () => {
    const config = new ModulesConfigurator();
    const failure = new Error('original');
    config.addConfig({
      module: { name: 'pending', initialize: () => new Promise<never>(() => {}) },
    });
    config.addConfig({
      module: {
        name: 'broken',
        initialize: async () => {
          throw failure;
        },
      },
    });
    await expect(config.initialize()).rejects.toBe(failure);
  });

  it('shares one disposal between the shorthand and configurator.dispose for the same instance', async () => {
    const config = new ModulesConfigurator();
    const dispose = vi.fn();
    config.addConfig({ module: { name: 'resource', initialize: () => ({}), dispose } });
    const modules = await config.initialize();
    await Promise.all([modules.dispose(), config.dispose(modules as never)]);
    expect(dispose).toHaveBeenCalledOnce();
  });

  it('keeps plugin teardowns owned by the instance that registered them', async () => {
    const config = new ModulesConfigurator();
    const failure = new Error('later attempt failed');
    const teardowns: Array<ReturnType<typeof vi.fn>> = [];
    config.registerPlugin(() => {
      const teardown = vi.fn();
      teardowns.push(teardown);
      return teardown;
    });
    config.addConfig({
      module: {
        name: 'resource',
        initialize: vi
          .fn<() => Promise<object>>()
          .mockResolvedValueOnce({})
          .mockResolvedValueOnce({})
          .mockRejectedValueOnce(failure),
      },
    });

    const first = await config.initialize();
    const second = await config.initialize();
    // A failed attempt's rollback must not run cleanup that belongs to live instances.
    await expect(config.initialize()).rejects.toBe(failure);
    expect(teardowns).toHaveLength(2);
    expect(teardowns[0]).not.toHaveBeenCalled();
    expect(teardowns[1]).not.toHaveBeenCalled();

    await first.dispose();
    expect(teardowns[0]).toHaveBeenCalledOnce();
    expect(teardowns[1]).not.toHaveBeenCalled();
    await config.dispose(second as never);
    expect(teardowns[1]).toHaveBeenCalledOnce();
  });

  it('disposes fixed phases in order, with concurrent default hooks and one host boundary', async () => {
    const order: string[] = [];
    const config = new ModulesConfigurator();
    config.event$.subscribe((event) => {
      if (
        event.name ===
        `${ModulesConfigurator.className}::${ModuleConfiguratorEventName.ModulesDisposed}`
      ) {
        order.push('default-complete');
      }
    });
    for (const definition of [
      { name: 'event', disposePhase: 'events' },
      { name: 'telemetry', disposePhase: 'diagnostics' },
      { name: 'implicit-default' },
      { name: 'explicit-default', disposePhase: 'default' },
    ] as const) {
      config.addConfig({
        module: {
          ...definition,
          initialize: () => ({}),
          dispose: async () => {
            order.push(`${definition.name}:start`);
            await Promise.resolve();
            order.push(`${definition.name}:end`);
          },
        },
      });
    }
    const modules = await config.initialize();
    const first = modules.dispose();
    expect(modules.dispose()).toBe(first);
    await first;
    expect(order).toEqual([
      'implicit-default:start',
      'explicit-default:start',
      'implicit-default:end',
      'explicit-default:end',
      'default-complete',
      'telemetry:start',
      'telemetry:end',
      'event:start',
      'event:end',
    ]);
  });

  it('shares repeated disposal per instance without skipping another initialized instance', async () => {
    const config = new ModulesConfigurator();
    const dispose = vi.fn();
    config.addConfig({
      module: { name: 'resource', initialize: () => ({}), dispose },
    });
    const first = await config.initialize();
    const second = await config.initialize();
    const disposal = first.dispose();
    expect(first.dispose()).toBe(disposal);
    await disposal;
    await second.dispose();
    expect(dispose).toHaveBeenCalledTimes(2);
  });

  it('continues through failed default and diagnostic teardown before disposing events', async () => {
    const order: string[] = [];
    const config = new ModulesConfigurator();
    const events: ModuleEvent[] = [];
    config.event$.subscribe((event) => events.push(event));
    for (const definition of [
      { name: 'event', disposePhase: 'events' },
      { name: 'telemetry', disposePhase: 'diagnostics' },
      { name: 'ordinary', disposePhase: 'default' },
    ] as const) {
      config.addConfig({
        module: {
          ...definition,
          initialize: () => ({}),
          dispose: async () => {
            await Promise.resolve();
            order.push(definition.name);
            if (definition.name !== 'event') throw new Error('teardown failed');
          },
        },
      });
    }
    const modules = await config.initialize();
    await expect(modules.dispose()).resolves.toBeUndefined();
    expect(order).toEqual(['ordinary', 'telemetry', 'event']);
    expect(
      events.filter(
        (event) =>
          event.name ===
          `${ModulesConfigurator.className}::${ModuleConfiguratorEventName.ModuleDisposeError}`,
      ),
    ).toHaveLength(2);
    expect(
      events.filter(
        (event) =>
          event.name ===
          `${ModulesConfigurator.className}::${ModuleConfiguratorEventName.ModulesDisposed}`,
      ),
    ).toEqual([
      expect.objectContaining({
        level: ModuleEventLevel.Warning,
        properties: expect.objectContaining({ failed: true }),
      }),
    ]);
  });

  it.each(['after-events', Number.NaN, 2])(
    'reports invalid runtime phase %s and still cleans up the provider during default teardown',
    async (phase) => {
      const order: string[] = [];
      const events: ModuleEvent[] = [];
      const config = new ModulesConfigurator();
      config.event$.subscribe((event) => events.push(event));
      const invalid = {
        name: 'invalid',
        initialize: () => ({}),
        dispose: () => {
          order.push('invalid');
        },
      };
      Reflect.set(invalid, 'disposePhase', phase);
      config.addConfig({
        module: {
          name: 'event',
          disposePhase: 'events',
          initialize: () => ({}),
          dispose: () => {
            order.push('event');
          },
        },
      });
      config.addConfig({ module: invalid });
      const modules = await config.initialize();
      await modules.dispose();
      expect(order).toEqual(['invalid', 'event']);
      expect(events).toContainEqual(
        expect.objectContaining({
          name: `${ModulesConfigurator.className}::${ModuleConfiguratorEventName.ModulesDispose}`,
          level: ModuleEventLevel.Warning,
          error: expect.any(TypeError),
          properties: { moduleName: 'invalid' },
        }),
      );
      expect(
        events.filter(
          (event) =>
            event.name ===
            `${ModulesConfigurator.className}::${ModuleConfiguratorEventName.ModulesDisposed}`,
        ),
      ).toEqual([
        expect.objectContaining({
          level: ModuleEventLevel.Warning,
          properties: expect.objectContaining({ failed: true }),
        }),
      ]);
    },
  );

  it('identifies only the telemetry export request and retains ownership through option copies', () => {
    const original = { method: 'POST', body: 'payload' };
    const marked = markTelemetryExportRequest(original);
    expect(telemetryExportRequest in original).toBe(false);
    expect({ ...marked }[telemetryExportRequest]).toBe(true);
    expect(JSON.stringify(marked)).toBe(JSON.stringify(original));
  });
});
