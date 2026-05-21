import { describe, it, expect, vi } from 'vitest';
import type { AnyModule } from '../../types.js';
import { ModulesConfigurator } from '../../lib/configurator/ModulesConfigurator.js';
import { createMockModule, createMinimalModule, collectEvents } from '../helpers.js';

describe('ModulesConfigurator', () => {
  // ─── Registration ──────────────────────────────────────────────────────────

  describe('addConfig', () => {
    it('registers the module', () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha');
      configurator.addConfig({ module: mod });
      expect(configurator.modules).toContain(mod);
    });

    it('deduplicates the same module added twice', () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha');
      configurator.addConfig({ module: mod });
      configurator.addConfig({ module: mod });
      expect(configurator.modules.filter((m) => m === mod)).toHaveLength(1);
    });

    it('wires configure callback into the configure phase', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha', { x: 1 });
      const configureSpy = vi.fn();
      configurator.addConfig({ module: mod, configure: configureSpy });
      await configurator.initialize();
      expect(configureSpy).toHaveBeenCalledOnce();
    });

    it('wires afterConfig callback into the post-configure phase', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha', { x: 1 });
      const afterConfigSpy = vi.fn();
      configurator.addConfig({ module: mod, afterConfig: afterConfigSpy });
      await configurator.initialize();
      expect(afterConfigSpy).toHaveBeenCalledOnce();
    });

    it('wires afterInit callback into the post-initialize phase', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha');
      const afterInitSpy = vi.fn();
      configurator.addConfig({ module: mod, afterInit: afterInitSpy });
      await configurator.initialize();
      expect(afterInitSpy).toHaveBeenCalledOnce();
    });

    it('emits a moduleConfigAdded event', () => {
      const configurator = new ModulesConfigurator();
      const [events, cleanup] = collectEvents(configurator.event$);
      configurator.addConfig({ module: createMockModule('alpha') });
      cleanup();
      const names = events.map((e) => (e as { name: string }).name);
      expect(names.some((n) => n.includes('moduleConfigAdded'))).toBe(true);
    });
  });

  describe('configure (multi-add shorthand)', () => {
    it('registers all provided modules', () => {
      const configurator = new ModulesConfigurator();
      const a = createMockModule('alpha');
      const b = createMockModule('beta');
      configurator.configure({ module: a }, { module: b });
      expect(configurator.modules).toContain(a);
      expect(configurator.modules).toContain(b);
    });
  });

  describe('constructor modules', () => {
    it('pre-registers modules passed to the constructor', () => {
      const a = createMockModule('alpha');
      const b = createMockModule('beta');
      const configurator = new ModulesConfigurator([a, b]);
      expect(configurator.modules).toContain(a);
      expect(configurator.modules).toContain(b);
    });
  });

  // ─── Lifecycle hooks ───────────────────────────────────────────────────────

  describe('onConfigured', () => {
    it('is called after all configure callbacks run', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha', { x: 1 });
      const order: string[] = [];
      configurator.addConfig({
        module: mod,
        configure: () => {
          order.push('configure');
        },
      });
      configurator.onConfigured(() => {
        order.push('onConfigured');
      });
      await configurator.initialize();
      expect(order).toEqual(['configure', 'onConfigured']);
    });

    it('receives the merged config map', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha', { x: 42 });
      let receivedConfig: unknown;
      configurator.addConfig({ module: mod });
      configurator.onConfigured((config) => {
        receivedConfig = config;
      });
      await configurator.initialize();
      expect(receivedConfig).toHaveProperty('alpha');
    });
  });

  describe('onInitialized', () => {
    it('is called after all modules are initialized', async () => {
      const configurator = new ModulesConfigurator();
      const mod = createMockModule('alpha');
      let receivedInstance: unknown;
      configurator.addConfig({ module: mod });
      configurator.onInitialized((instance) => {
        receivedInstance = instance;
      });
      await configurator.initialize();
      expect(receivedInstance).toHaveProperty('alpha');
    });
  });

  // ─── initialize ───────────────────────────────────────────────────────────

  describe('initialize', () => {
    it('returns a sealed instance with all module providers', async () => {
      const a = createMockModule('alpha');
      const b = createMockModule('beta');
      const configurator = new ModulesConfigurator([a, b]);
      const instance = await configurator.initialize();
      expect(instance).toHaveProperty('alpha');
      expect(instance).toHaveProperty('beta');
    });

    it('passes ref through to module configure and initialize', async () => {
      const mod = createMockModule('alpha', { x: 1 });
      const configurator = new ModulesConfigurator([mod]);
      const ref = { framework: true };
      const configureSpy = vi.fn();
      const initSpy = vi.fn(async ({ config, ref }: { config: unknown; ref?: unknown }) => ({
        name: 'alpha',
        version: '1.0.0',
        config,
        ref,
      }));
      configurator.addConfig({
        module: { ...mod, configure: vi.fn(async () => ({})), initialize: initSpy },
        configure: configureSpy,
      });
      await configurator.initialize(ref);
      expect(configureSpy).toHaveBeenCalledWith(expect.anything(), ref);
      expect(initSpy.mock.calls[0][0].ref).toBe(ref);
    });

    it('seals the returned instance (no new properties)', async () => {
      const configurator = new ModulesConfigurator([createMockModule('alpha')]);
      const instance = await configurator.initialize();
      expect(Object.isSealed(instance)).toBe(true);
    });

    it('instance has a dispose() shorthand', async () => {
      const configurator = new ModulesConfigurator([createMockModule('alpha')]);
      const instance = await configurator.initialize();
      expect(typeof (instance as Record<string, unknown>).dispose).toBe('function');
    });

    it('calls each module configure() once', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      await configurator.initialize();
      expect(mod.configure).toHaveBeenCalledOnce();
    });

    it('calls each module initialize() once', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      await configurator.initialize();
      expect(mod.initialize).toHaveBeenCalledOnce();
    });

    it('calls module postConfigure() once', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      await configurator.initialize();
      expect(mod.postConfigure).toHaveBeenCalledOnce();
    });

    it('calls module postInitialize() once', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      await configurator.initialize();
      expect(mod.postInitialize).toHaveBeenCalledOnce();
    });

    it('throws when a module has no initialize method', async () => {
      // @ts-expect-error intentionally missing initialize
      const bad: AnyModule = { name: 'bad' };
      const configurator = new ModulesConfigurator([bad]);
      await expect(configurator.initialize()).rejects.toThrow(/does not have initialize method/);
    });

    it('works with modules that have no optional hooks', async () => {
      const mod = createMinimalModule('minimal');
      const configurator = new ModulesConfigurator([mod]);
      const instance = await configurator.initialize();
      expect(instance).toHaveProperty('minimal');
    });

    it('initializes modules with zero config (no configure() defined)', async () => {
      const mod: AnyModule = {
        name: 'bare',
        initialize: vi.fn(async () => ({ name: 'bare', version: '1.0.0', config: undefined })),
      };
      const configurator = new ModulesConfigurator([mod]);
      const instance = await configurator.initialize();
      expect(instance).toHaveProperty('bare');
    });

    it('emits information-level initialize event', async () => {
      const configurator = new ModulesConfigurator([createMockModule('alpha')]);
      const [events, cleanup] = collectEvents(configurator.event$);
      await configurator.initialize();
      cleanup();
      const names = events.map((e) => (e as { name: string }).name);
      expect(names.some((n: string) => n.includes('initialize') && !n.includes('.'))).toBe(true);
    });
  });

  // ─── Cross-module dependency (requireInstance) ─────────────────────────────

  describe('cross-module dependency via requireInstance', () => {
    it('module B can require module A during initialization', async () => {
      const modA = createMockModule('alpha', {});
      const modB: AnyModule = {
        name: 'beta',
        initialize: vi.fn(async ({ requireInstance }) => {
          const alpha = await requireInstance('alpha');
          return { name: 'beta', version: '1.0.0', dependsOn: alpha };
        }),
      };
      const configurator = new ModulesConfigurator([modA, modB]);
      const instance = await configurator.initialize();
      expect((instance as Record<string, unknown>).beta).toBeDefined();
      const beta = (instance as Record<string, Record<string, unknown>>).beta;
      expect(beta.dependsOn).toBeDefined();
      expect((beta.dependsOn as { name: string }).name).toBe('alpha');
    });

    it('requireInstance throws when module is not registered', async () => {
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async ({ requireInstance }) => {
          await requireInstance('nonexistent' as never);
          return { name: 'alpha', version: '1.0.0' };
        }),
      };
      const configurator = new ModulesConfigurator([mod]);
      await expect(configurator.initialize()).rejects.toThrow(/not defined/);
    });
  });

  // ─── dispose ──────────────────────────────────────────────────────────────

  describe('dispose', () => {
    it('calls dispose on each module that declares it', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      const instance = await configurator.initialize();
      await configurator.dispose(instance as never);
      expect(mod.dispose).toHaveBeenCalledOnce();
    });

    it('completes the event$ stream after dispose', async () => {
      const mod = createMockModule('alpha');
      const configurator = new ModulesConfigurator([mod]);
      const instance = await configurator.initialize();
      let completed = false;
      configurator.event$.subscribe({
        complete: () => {
          completed = true;
        },
      });
      await configurator.dispose(instance as never);
      expect(completed).toBe(true);
    });

    it('skips modules without a dispose hook', async () => {
      const mod = createMinimalModule('minimal');
      const configurator = new ModulesConfigurator([mod]);
      const instance = await configurator.initialize();
      // Should not throw
      await expect(configurator.dispose(instance as never)).resolves.toBeUndefined();
    });
  });

  // ─── Event stream ──────────────────────────────────────────────────────────

  describe('event$', () => {
    it('namespaces events with the class name', async () => {
      const configurator = new ModulesConfigurator([createMockModule('alpha')]);
      const [events, cleanup] = collectEvents(configurator.event$);
      await configurator.initialize();
      cleanup();
      const names = events.map((e) => (e as { name: string }).name);
      expect(names.every((n: string) => n.startsWith('ModulesConfigurator::'))).toBe(true);
    });

    it('subclass events use subclass className', async () => {
      class MyConfigurator extends ModulesConfigurator {
        static override readonly className = 'MyConfigurator';
      }
      const configurator = new MyConfigurator([createMockModule('alpha')]);
      const [events, cleanup] = collectEvents(configurator.event$);
      await configurator.initialize();
      cleanup();
      const names = events.map((e) => (e as { name: string }).name);
      expect(names.every((n: string) => n.startsWith('MyConfigurator::'))).toBe(true);
    });
  });
});
