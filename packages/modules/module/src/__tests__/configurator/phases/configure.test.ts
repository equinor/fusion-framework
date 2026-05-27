import { describe, it, expect, vi } from 'vitest';
import {
  runConfigurePhase,
  createModuleConfigs,
  runPostConfigureHooks,
  type ConfigurePhaseContext,
} from '../../../lib/configurator/phases/configure.js';
import { ModuleConfiguratorEventName } from '../../../lib/configurator/events.js';
import type { AnyModule, ModuleEvent } from '../../../types.js';

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
