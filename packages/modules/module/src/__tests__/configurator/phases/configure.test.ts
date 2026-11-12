import { describe, it, expect, vi } from 'vitest';
import {
  createModuleConfigs,
  type ConfigurePhaseContext,
} from '../../../lib/configurator/phases/create-module-configs.js';
import { runPostConfigureHooks } from '../../../lib/configurator/phases/run-post-configure-hooks.js';
import { runConfigurePhase } from '../../../lib/configurator/phases/run-configure-phase.js';
import { ModuleConfiguratorEventName } from '../../../lib/configurator/module-configurator-event-name.js';
import { ModulesConfigurator } from '../../../lib/configurator/ModulesConfigurator.js';
import type { AnyModule, Module, ModuleEvent } from '../../../types.js';

function makeCtx(
  modules: AnyModule[],
  overrides: Partial<ConfigurePhaseContext<unknown>> = {},
): ConfigurePhaseContext<unknown> {
  const afterConfiguration: ((config: unknown) => void | Promise<void>)[] = [];
  const afterInit: ((instance: unknown) => void | Promise<void>)[] = [];
  return {
    modules,
    configs: [],
    afterConfiguration,
    afterInit,
    registerEvent: vi.fn(),
    ...overrides,
  };
}

describe('configure phase', () => {
  describe('synchronous preparation phase', () => {
    it('prepares one builder immediately and uses it for deferred configuration and initialization', async () => {
      const builder = { value: 1 };
      const prepareFactory = vi.fn(() => builder);
      const configureFactory = vi.fn(() => ({ value: -1 }));
      const configure = vi.fn(async (actual: typeof builder, ref?: unknown) => {
        expect(actual).toBe(builder);
        expect(ref).toEqual({ parent: true });
        await Promise.resolve();
        actual.value += 4;
      });
      const module: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        prepare: prepareFactory,
        configure: configureFactory,
        initialize: ({ config }) => config,
      };
      const config = new ModulesConfigurator();
      config.addConfig({
        module,
        prepare: (actual) => {
          expect(actual).toBe(builder);
          actual.value += 1;
        },
        configure,
      });
      config.addConfig({
        module,
        prepare: (actual) => {
          expect(actual).toBe(builder);
          actual.value += 2;
        },
      });
      expect(builder.value).toBe(4);
      expect(prepareFactory).toHaveBeenCalledOnce();
      expect(configureFactory).not.toHaveBeenCalled();
      expect(configure).not.toHaveBeenCalled();
      const modules = await config.initialize<[typeof module]>({ parent: true });
      expect(modules.prepared).toBe(builder);
      expect(modules.prepared.value).toBe(8);
      expect(configureFactory).not.toHaveBeenCalled();
      expect(prepareFactory).toHaveBeenCalledOnce();
      await modules.dispose();
    });

    it('uses a supplied builder without running either factory', async () => {
      const builder = { value: 1 };
      const factory = vi.fn(() => ({ value: -1 }));
      const module: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        prepare: factory,
        configure: factory,
        initialize: ({ config }) => config,
      };
      const prepare = vi.fn();
      const config = new ModulesConfigurator();
      config.addConfig({ module, configurator: builder, prepare });
      expect(prepare).toHaveBeenCalledWith(builder);
      const modules = await config.initialize<[typeof module]>();
      expect(modules.prepared).toBe(builder);
      expect(factory).not.toHaveBeenCalled();
      await modules.dispose();
    });

    it('does not invoke opt-in factories for ordinary registrations or replace the initialize reference', async () => {
      const builder = { value: 1 };
      const prepareFactory = vi.fn(() => builder);
      const configureFactory = vi.fn(() => builder);
      const module: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        prepare: prepareFactory,
        configure: configureFactory,
        initialize: ({ config }) => config,
      };
      const config = new ModulesConfigurator([module]);
      config.addConfig({ module, configure: vi.fn() });
      expect(prepareFactory).not.toHaveBeenCalled();
      expect(configureFactory).not.toHaveBeenCalled();
      const ref = { parent: true };
      const modules = await config.initialize<[typeof module]>(ref);
      expect(prepareFactory).not.toHaveBeenCalled();
      expect(configureFactory).toHaveBeenCalledWith(ref);
      await modules.dispose();
    });

    it('rejects preparation of ordinary factories rather than invoking them without their reference', () => {
      const factory = vi.fn(() => ({ value: 1 }));
      const module = { name: 'ordinary', configure: factory, initialize: vi.fn() };
      const config = new ModulesConfigurator();
      expect(() => config.addConfig({ module, prepare: vi.fn() })).toThrow(
        'requires a prepare factory or an explicit configurator',
      );
      expect(factory).not.toHaveBeenCalled();
    });

    it('leaves the previous registration untouched when a replacement fails preparation', async () => {
      const original: Module<'prepared', { value: number }, { value: number }> = {
        name: 'prepared',
        configure: () => ({ value: 1 }),
        initialize: ({ config }) => config,
      };
      const replacement: Module<'prepared', { value: number }, { value: number }> = {
        ...original,
        prepare: () => ({ value: 2 }),
      };
      const configure = vi.fn((config: { value: number }) => {
        config.value += 10;
      });
      const config = new ModulesConfigurator();
      config.addConfig({ module: original, configure });
      const failure = new Error('preparation failed');
      expect(() =>
        config.addConfig({
          module: replacement,
          prepare: () => {
            throw failure;
          },
        }),
      ).toThrow(failure);
      const modules = await config.initialize<[typeof original]>();
      expect(configure).toHaveBeenCalledOnce();
      expect(modules.prepared).toEqual({ value: 11 });
      await modules.dispose();
    });

    it('does not register a module whose first preparation fails', async () => {
      const module = { name: 'broken', prepare: () => ({}), initialize: vi.fn() };
      const config = new ModulesConfigurator();
      expect(() =>
        config.addConfig({
          module,
          prepare: () => {
            throw new Error('preparation failed');
          },
        }),
      ).toThrow('preparation failed');
      expect(config.modules).toEqual([]);
      const modules = await config.initialize();
      expect(module.initialize).not.toHaveBeenCalled();
      await modules.dispose();
    });

    it('preserves synchronous preparation errors and emits a preparation failure event', () => {
      const failure = new Error('original preparation failure');
      const module = { name: 'broken', prepare: () => ({}), initialize: vi.fn() };
      const config = new ModulesConfigurator();
      const events: ModuleEvent[] = [];
      const subscription = config.event$.subscribe((event) => events.push(event));
      expect(() =>
        config.addConfig({
          module,
          prepare: () => {
            throw failure;
          },
        }),
      ).toThrow(failure);
      expect(events.at(-1)).toMatchObject({
        name: expect.stringContaining(ModuleConfiguratorEventName.ConfiguratorPrepareError),
        error: failure,
      });
      subscription.unsubscribe();
    });

    it.each(['factory', 'callback'])(
      'rejects asynchronous preparation %s and observes its rejection',
      async (kind) => {
        const warning = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const asynchronous = async (): Promise<never> => {
          throw new Error('private-preparation-sentinel');
        };
        const module: AnyModule = {
          name: 'asynchronous',
          prepare: kind === 'factory' ? asynchronous : () => ({}),
          initialize: vi.fn(),
        };
        const config = new ModulesConfigurator();
        expect(() =>
          config.addConfig({
            module,
            prepare: kind === 'callback' ? asynchronous : vi.fn(),
          }),
        ).toThrow('must be synchronous');
        await vi.waitFor(() =>
          expect(warning).toHaveBeenCalledWith(
            'Asynchronous preparation failed for module "asynchronous"',
          ),
        );
        expect(JSON.stringify(warning.mock.calls)).not.toContain('private-preparation-sentinel');
        warning.mockRestore();
      },
    );
  });

  describe('prepared configuration registration', () => {
    it('uses the exact builder in additive callbacks, postConfigure and initialization without calling the factory', async () => {
      const builder = { value: 1 };
      const factory = vi.fn(async () => ({ value: -1 }));
      const first = vi.fn((config: typeof builder) => {
        config.value += 1;
      });
      const second = vi.fn((config: typeof builder) => {
        config.value += 2;
      });
      const postConfigure = vi.fn();
      const initialize = vi.fn(({ config }: { config: typeof builder }) => config);
      const module: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        configure: factory,
        initialize,
        postConfigure,
      };
      const config = new ModulesConfigurator();
      config.addConfig({ module, configurator: builder, configure: first });
      config.addConfig({ module, configure: second });
      const modules = await config.initialize<[typeof module]>();
      expect(factory).not.toHaveBeenCalled();
      expect(first).toHaveBeenCalledWith(builder, undefined);
      expect(second).toHaveBeenCalledWith(builder, undefined);
      expect(postConfigure.mock.calls[0][0].prepared).toBe(builder);
      expect(initialize.mock.calls[0][0].config).toBe(builder);
      expect(modules.prepared).toBe(builder);
      expect(builder.value).toBe(4);
      await modules.dispose();
    });

    it('isolates registration by host and descriptor and discards the builder on descriptor replacement', async () => {
      const builder = { value: 1 };
      const factory = vi.fn(async () => ({ value: 2 }));
      const original: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        configure: factory,
        initialize: ({ config }) => config,
      };
      const replacement = { ...original };
      const config = new ModulesConfigurator();
      const oldCallback = vi.fn();
      config.addConfig({ module: original, configurator: builder, configure: oldCallback });
      const otherHost = new ModulesConfigurator([original]);
      const otherModules = await otherHost.initialize<[typeof original]>();
      expect(otherModules.prepared).toEqual({ value: 2 });
      expect(otherModules.prepared).not.toBe(builder);
      await otherModules.dispose();
      factory.mockClear();
      config.addConfig({ module: replacement });
      const modules = await config.initialize<[typeof replacement]>();
      expect(factory).toHaveBeenCalledOnce();
      expect(oldCallback).not.toHaveBeenCalled();
      expect(modules.prepared).toEqual({ value: 2 });
      await modules.dispose();
    });

    it('preserves the original rejection when a callback fails with a prepared builder', async () => {
      const builder = { value: 1 };
      const failure = new Error('configuration failed');
      const factory = vi.fn(() => builder);
      const initialize = vi.fn(() => builder);
      const module: Module<'prepared', typeof builder, typeof builder> = {
        name: 'prepared',
        configure: factory,
        initialize,
      };
      const config = new ModulesConfigurator();
      config.addConfig({
        module,
        configurator: builder,
        configure: async (actual) => {
          expect(actual).toBe(builder);
          await Promise.resolve();
          throw failure;
        },
      });
      await expect(config.initialize()).rejects.toBe(failure);
      expect(factory).not.toHaveBeenCalled();
      expect(initialize).not.toHaveBeenCalled();
    });
  });

  // ─── createModuleConfigs ────────────────────────────────────────────────

  describe('createModuleConfigs', () => {
    it('calls module.configure() for each module', async () => {
      const configureSpy = vi.fn(async () => ({ x: 1 }));
      const mod: AnyModule = { name: 'alpha', configure: configureSpy, initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      await createModuleConfigs(ctx);
      expect(configureSpy).toHaveBeenCalledOnce();
    });

    it('produces a config object keyed by module name', async () => {
      const mod: AnyModule = {
        name: 'alpha',
        configure: async () => ({ value: 42 }),
        initialize: vi.fn(),
      };
      const ctx = makeCtx([mod]);
      const config = await createModuleConfigs(ctx);
      expect(config).toHaveProperty('alpha');
      expect((config as Record<string, unknown>).alpha).toEqual({ value: 42 });
    });

    it('handles modules with no configure() (returns undefined config)', async () => {
      const mod: AnyModule = { name: 'bare', initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      const config = await createModuleConfigs(ctx);
      expect(config).toHaveProperty('bare');
    });

    it('exposes onAfterConfiguration on the config object', async () => {
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      const config = await createModuleConfigs(ctx);
      const cb = vi.fn();
      (config as { onAfterConfiguration: (cb: unknown) => void }).onAfterConfiguration(cb);
      expect(ctx.afterConfiguration).toContain(cb);
    });

    it('exposes onAfterInit on the config object', async () => {
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      const config = await createModuleConfigs(ctx);
      const cb = vi.fn();
      (config as { onAfterInit: (cb: unknown) => void }).onAfterInit(cb);
      expect(ctx.afterInit).toContain(cb);
    });

    it('emits a configuratorCreated event for each module', async () => {
      const registerEvent = vi.fn();
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const ctx = makeCtx([mod], { registerEvent });
      await createModuleConfigs(ctx);
      const eventNames = registerEvent.mock.calls.map((args) => (args[0] as ModuleEvent).name);
      expect(eventNames).toContain(ModuleConfiguratorEventName.ConfiguratorCreated);
    });

    it('emits an error event and rethrows when configure() throws', async () => {
      const registerEvent = vi.fn();
      const mod: AnyModule = {
        name: 'bad',
        configure: async () => {
          throw new Error('configure failed');
        },
        initialize: vi.fn(),
      };
      const ctx = makeCtx([mod], { registerEvent });
      await expect(createModuleConfigs(ctx)).rejects.toThrow('configure failed');
      const events = registerEvent.mock.calls.map((args) => args[0] as ModuleEvent);
      expect(events.some((e) => e.name.includes('Failed') || e.error)).toBe(true);
    });

    it('passes ref to module.configure()', async () => {
      const configureSpy = vi.fn(async () => ({}));
      const mod: AnyModule = { name: 'alpha', configure: configureSpy, initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      const ref = { parent: true };
      await createModuleConfigs(ctx, ref);
      expect(configureSpy).toHaveBeenCalledWith(ref);
    });
  });

  // ─── runPostConfigureHooks ─────────────────────────────────────────────

  describe('runPostConfigureHooks', () => {
    it('calls module.postConfigure() for each module that has it', async () => {
      const postConfigureSpy = vi.fn(async () => {});
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(),
        postConfigure: postConfigureSpy,
      };
      const ctx = makeCtx([mod]);
      const config = { alpha: {} };
      await runPostConfigureHooks(ctx, config);
      expect(postConfigureSpy).toHaveBeenCalledOnce();
    });

    it('runs afterConfiguration callbacks', async () => {
      const afterCb = vi.fn();
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const ctx = makeCtx([mod]);
      ctx.afterConfiguration.push(afterCb);
      const config = { alpha: {} };
      await runPostConfigureHooks(ctx, config);
      expect(afterCb).toHaveBeenCalledWith(config);
    });

    it('does not throw when postConfigure() fails — isolates failure', async () => {
      const mod: AnyModule = {
        name: 'bad',
        initialize: vi.fn(),
        postConfigure: vi.fn(async () => {
          throw new Error('post-configure failed');
        }),
      };
      const ctx = makeCtx([mod]);
      // Should not throw even though postConfigure throws
      await expect(runPostConfigureHooks(ctx, {})).resolves.toBeUndefined();
    });

    it('skips afterConfiguration loop when array is empty', async () => {
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const ctx = makeCtx([mod]); // afterConfiguration is empty
      // Should not throw
      await expect(runPostConfigureHooks(ctx, {})).resolves.toBeUndefined();
    });
  });

  // ─── runConfigurePhase ─────────────────────────────────────────────────

  describe('runConfigurePhase', () => {
    it('creates config, applies user callbacks, and runs post-configure', async () => {
      const order: string[] = [];
      const mod: AnyModule = {
        name: 'alpha',
        configure: vi.fn(async () => {
          order.push('configure');
          return { x: 1 };
        }),
        initialize: vi.fn(),
        postConfigure: vi.fn(async () => {
          order.push('postConfigure');
        }),
      };
      const userConfigCb = vi.fn((_cfg: unknown) => {
        order.push('userConfig');
      });
      const ctx = makeCtx([mod], {
        configs: [(cfg: unknown) => userConfigCb(cfg)],
      });
      await runConfigurePhase(ctx);
      // configure runs before userConfig, postConfigure runs last
      expect(order).toEqual(['configure', 'userConfig', 'postConfigure']);
    });

    it('user config callback receives the module config keyed by module name', async () => {
      const mod: AnyModule = {
        name: 'alpha',
        configure: async () => ({ val: 7 }),
        initialize: vi.fn(),
      };
      let capturedConfig: unknown;
      const ctx = makeCtx([mod], {
        configs: [
          (cfg: unknown) => {
            capturedConfig = cfg;
          },
        ],
      });
      await runConfigurePhase(ctx);
      expect((capturedConfig as Record<string, unknown>).alpha).toEqual({ val: 7 });
    });

    it('passes ref to user config callbacks', async () => {
      const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
      const cbSpy = vi.fn();
      const ref = { parent: true };
      const ctx = makeCtx([mod], { configs: [cbSpy] });
      await runConfigurePhase(ctx, ref);
      expect(cbSpy).toHaveBeenCalledWith(expect.anything(), ref);
    });
  });
});
