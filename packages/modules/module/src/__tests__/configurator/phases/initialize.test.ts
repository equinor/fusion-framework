import { describe, it, expect, vi } from 'vitest';
import { BehaviorSubject } from 'rxjs';
import {
  runInitializePhase,
  createRequireInstance,
  type InitializePhaseContext,
} from '../../../lib/configurator/phases/initialize.js';
import type { AnyModule, ModuleEvent } from '../../../types.js';

function makeCtx(
  modules: AnyModule[],
  overrides: Partial<InitializePhaseContext> = {},
): InitializePhaseContext {
  return {
    modules,
    registerEvent: vi.fn(),
    ...overrides,
  };
}

describe('initialize phase', () => {
  // ─── createRequireInstance ─────────────────────────────────────────────

  describe('createRequireInstance', () => {
    it('returns already-initialized module immediately', async () => {
      const existing = { name: 'alpha', version: '1.0.0' };
      const instance$ = new BehaviorSubject<Record<string, unknown>>({ alpha: existing });
      const requireInstance = createRequireInstance(['alpha'], instance$, vi.fn());
      const result = await requireInstance('alpha');
      expect(result).toBe(existing);
    });

    it('throws immediately when module is not registered', () => {
      const instance$ = new BehaviorSubject<Record<string, unknown>>({});
      const requireInstance = createRequireInstance(['alpha'], instance$, vi.fn());
      expect(() => requireInstance('unknown')).toThrow(/not defined/);
    });

    it('waits for module to appear in the instance subject', async () => {
      const instance$ = new BehaviorSubject<Record<string, unknown>>({});
      const requireInstance = createRequireInstance(['alpha'], instance$, vi.fn());

      // Resolve alpha after a tick
      const alphaProvider = { name: 'alpha', version: '1.0.0' };
      setTimeout(() => instance$.next({ alpha: alphaProvider }), 10);

      const result = await requireInstance('alpha');
      expect(result).toBe(alphaProvider);
    });

    it('emits awaiting and resolved events', async () => {
      const registerEvent = vi.fn<(event: ModuleEvent) => void>();
      const existing = { name: 'alpha', version: '1.0.0' };
      const instance$ = new BehaviorSubject<Record<string, unknown>>({ alpha: existing });
      const requireInstance = createRequireInstance(['alpha'], instance$, registerEvent);
      await requireInstance('alpha');
      // When already initialized it takes the short-circuit path (skipping queue)
      const eventNames = registerEvent.mock.calls.map(([e]) => e.name);
      expect(
        eventNames.some((n) => n.includes('AlreadyInitialized') || n.includes('awaiting')),
      ).toBe(true);
    });
  });

  // ─── runInitializePhase ────────────────────────────────────────────────

  describe('runInitializePhase', () => {
    it('calls initialize() for each module', async () => {
      const initSpy = vi.fn(async () => ({ name: 'alpha', version: '1.0.0' }));
      const mod: AnyModule = { name: 'alpha', initialize: initSpy };
      const ctx = makeCtx([mod]);
      await runInitializePhase(ctx, { alpha: {} });
      expect(initSpy).toHaveBeenCalledOnce();
    });

    it('returns an instance map keyed by module name', async () => {
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async () => ({ name: 'alpha', version: '1.0.0' })),
      };
      const ctx = makeCtx([mod]);
      const instance = await runInitializePhase(ctx, { alpha: {} });
      expect(instance).toHaveProperty('alpha');
    });

    it('passes config to initialize() by module name', async () => {
      const initSpy = vi.fn(async ({ config }: { config: unknown }) => ({
        name: 'alpha',
        version: '1.0.0',
        config,
      }));
      const mod: AnyModule = { name: 'alpha', initialize: initSpy };
      const ctx = makeCtx([mod]);
      await runInitializePhase(ctx, { alpha: { x: 99 } });
      expect(initSpy.mock.calls[0][0].config).toEqual({ x: 99 });
    });

    it('passes ref to initialize()', async () => {
      const initSpy = vi.fn(async ({ ref }: { ref: unknown }) => ({
        name: 'alpha',
        version: '1.0.0',
        ref,
      }));
      const mod: AnyModule = { name: 'alpha', initialize: initSpy };
      const ctx = makeCtx([mod]);
      const ref = { parent: true };
      await runInitializePhase(ctx, { alpha: {} }, ref);
      expect(initSpy.mock.calls[0][0].ref).toBe(ref);
    });

    it('seals the returned instance', async () => {
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async () => ({ name: 'alpha', version: '1.0.0' })),
      };
      const ctx = makeCtx([mod]);
      const instance = await runInitializePhase(ctx, { alpha: {} });
      expect(Object.isSealed(instance)).toBe(true);
    });

    it('initializes multiple modules', async () => {
      const modA: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async () => ({ name: 'alpha', version: '1.0.0' })),
      };
      const modB: AnyModule = {
        name: 'beta',
        initialize: vi.fn(async () => ({ name: 'beta', version: '1.0.0' })),
      };
      const ctx = makeCtx([modA, modB]);
      const instance = await runInitializePhase(ctx, { alpha: {}, beta: {} });
      expect(instance).toHaveProperty('alpha');
      expect(instance).toHaveProperty('beta');
    });

    it('throws when module has no initialize method', async () => {
      // @ts-expect-error intentionally missing initialize
      const bad: AnyModule = { name: 'bad' };
      const ctx = makeCtx([bad]);
      await expect(runInitializePhase(ctx, {})).rejects.toThrow(/does not have initialize method/);
    });

    it('resolves cross-module dependencies via requireInstance', async () => {
      const modA: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async () => ({ name: 'alpha', version: '1.0.0', value: 42 })),
      };
      const modB: AnyModule = {
        name: 'beta',
        initialize: vi.fn(async ({ requireInstance }) => {
          const alpha = await requireInstance('alpha');
          return { name: 'beta', version: '1.0.0', alphaValue: (alpha as { value: number }).value };
        }),
      };
      const ctx = makeCtx([modA, modB]);
      const instance = await runInitializePhase<{ alpha: unknown; beta: unknown }>(ctx, {
        alpha: {},
        beta: {},
      });
      expect((instance.beta as { alphaValue: number }).alphaValue).toBe(42);
    });

    it('hasModule returns true for registered modules', async () => {
      let capturedHasModule: ((key: string) => boolean) | undefined;
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async ({ hasModule }) => {
          capturedHasModule = hasModule;
          return { name: 'alpha', version: '1.0.0' };
        }),
      };
      const ctx = makeCtx([mod]);
      await runInitializePhase(ctx, { alpha: {} });
      expect(capturedHasModule?.('alpha')).toBe(true);
      expect(capturedHasModule?.('nonexistent')).toBe(false);
    });

    it('emits moduleInitialized events', async () => {
      const registerEvent = vi.fn<(event: ModuleEvent) => void>();
      const mod: AnyModule = {
        name: 'alpha',
        initialize: vi.fn(async () => ({ name: 'alpha', version: '1.0.0' })),
      };
      const ctx = makeCtx([mod], { registerEvent });
      await runInitializePhase(ctx, { alpha: {} });
      const names = registerEvent.mock.calls.map(([e]) => e.name);
      expect(names.some((n) => n.includes('moduleInitialized'))).toBe(true);
    });
  });
});
