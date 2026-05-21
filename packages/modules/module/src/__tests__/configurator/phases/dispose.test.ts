import { describe, it, expect, vi } from 'vitest';
import { Subject } from 'rxjs';
import {
  runDisposePhase,
  type DisposePhaseContext,
} from '../../../lib/configurator/phases/dispose.js';
import type { AnyModule, ModuleEvent } from '../../../types.js';

function makeCtx(
  modules: AnyModule[],
  overrides: Partial<DisposePhaseContext> = {},
): DisposePhaseContext {
  return {
    modules,
    registerEvent: vi.fn(),
    event$: new Subject<ModuleEvent>(),
    ...overrides,
  };
}

describe('dispose phase', () => {
  it('calls dispose() on each module that declares it', async () => {
    const disposeSpy = vi.fn(async () => {});
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: disposeSpy,
    };
    const instance = { alpha: { name: 'alpha' } };
    const ctx = makeCtx([mod]);
    await runDisposePhase(ctx, instance);
    expect(disposeSpy).toHaveBeenCalledOnce();
  });

  it('passes the full instance and module-specific instance to dispose()', async () => {
    const disposeSpy = vi.fn(
      async (_args: { modules: unknown; instance: unknown; ref?: unknown }) => {},
    );
    const provider = { name: 'alpha', version: '1.0.0' };
    const instance = { alpha: provider };
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: disposeSpy,
    };
    const ctx = makeCtx([mod]);
    await runDisposePhase(ctx, instance);
    const args = disposeSpy.mock.calls[0][0];
    expect(args.modules).toBe(instance);
    expect(args.instance).toBe(provider);
  });

  it('passes ref to dispose()', async () => {
    const disposeSpy = vi.fn(
      async (_args: { modules: unknown; instance: unknown; ref?: unknown }) => {},
    );
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: disposeSpy,
    };
    const ref = { parent: true };
    const ctx = makeCtx([mod]);
    await runDisposePhase(ctx, { alpha: {} }, ref);
    expect(disposeSpy.mock.calls[0][0].ref).toBe(ref);
  });

  it('skips modules with no dispose hook', async () => {
    const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
    const ctx = makeCtx([mod]);
    await expect(runDisposePhase(ctx, { alpha: {} })).resolves.toBeUndefined();
  });

  it('does not throw when dispose() fails — isolates failure', async () => {
    const failingMod: AnyModule = {
      name: 'bad',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {
        throw new Error('dispose failed');
      }),
    };
    const goodMod: AnyModule = {
      name: 'good',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {}),
    };
    const ctx = makeCtx([failingMod, goodMod]);
    await expect(runDisposePhase(ctx, { bad: {}, good: {} })).resolves.toBeUndefined();
    expect(goodMod.dispose).toHaveBeenCalledOnce();
  });

  it('runs plugin teardowns before module dispose', async () => {
    const order: string[] = [];
    const pluginTeardown = vi.fn(async () => {
      order.push('plugin');
    });
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {
        order.push('module');
      }),
    };
    const ctx = makeCtx([mod], { pluginTeardowns: [pluginTeardown] });
    await runDisposePhase(ctx, { alpha: {} });
    expect(order).toEqual(['plugin', 'module']);
  });

  it('runs disposable plugin teardowns before module dispose', async () => {
    const order: string[] = [];
    const pluginTeardown = {
      dispose: vi.fn(async () => {
        order.push('plugin');
      }),
    };
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {
        order.push('module');
      }),
    };
    const ctx = makeCtx([mod], { pluginTeardowns: [pluginTeardown] });
    await runDisposePhase(ctx, { alpha: {} });
    expect(order).toEqual(['plugin', 'module']);
  });

  it('isolates plugin teardown failures', async () => {
    const goodTeardown = vi.fn(async () => {});
    const badTeardown = vi.fn(async () => {
      throw new Error('plugin dispose failed');
    });
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {}),
    };
    const ctx = makeCtx([mod], { pluginTeardowns: [badTeardown, goodTeardown] });
    await expect(runDisposePhase(ctx, { alpha: {} })).resolves.toBeUndefined();
    expect(goodTeardown).toHaveBeenCalledOnce();
    expect(mod.dispose).toHaveBeenCalledOnce();
  });

  it('completes the event$ subject after all modules are disposed', async () => {
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {}),
    };
    const event$ = new Subject<ModuleEvent>();
    let completed = false;
    event$.subscribe({
      complete: () => {
        completed = true;
      },
    });
    const ctx = makeCtx([mod], { event$ });
    await runDisposePhase(ctx, { alpha: {} });
    expect(completed).toBe(true);
  });

  it('completes event$ even when there are no modules with dispose', async () => {
    const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
    const event$ = new Subject<ModuleEvent>();
    let completed = false;
    event$.subscribe({
      complete: () => {
        completed = true;
      },
    });
    const ctx = makeCtx([mod], { event$ });
    await runDisposePhase(ctx, { alpha: {} });
    expect(completed).toBe(true);
  });

  it('emits dispose and moduleDisposed events', async () => {
    const registerEvent = vi.fn<(event: ModuleEvent) => void>();
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      dispose: vi.fn(async () => {}),
    };
    const ctx = makeCtx([mod], { registerEvent });
    await runDisposePhase(ctx, { alpha: {} });
    const names = registerEvent.mock.calls.map(([e]) => e.name);
    expect(names.some((n) => n === 'dispose')).toBe(true);
    expect(names.some((n) => n.includes('moduleDisposed'))).toBe(true);
  });
});
