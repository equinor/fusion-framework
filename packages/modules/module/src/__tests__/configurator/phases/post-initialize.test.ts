import { describe, it, expect, vi } from 'vitest';
import {
  runPostInitializePhase,
  type PostInitializePhaseContext,
} from '../../../lib/configurator/phases/post-initialize.js';
import { ModuleConfiguratorEventName } from '../../../lib/configurator/events.js';
import type { AnyModule, ModuleEvent } from '../../../types.js';

function makeCtx(
  modules: AnyModule[],
  overrides: Partial<PostInitializePhaseContext> = {},
): PostInitializePhaseContext {
  return {
    modules,
    afterInit: [],
    registerEvent: vi.fn(),
    ...overrides,
  };
}

describe('post-initialize phase', () => {
  it('calls postInitialize() for each module that declares it', async () => {
    const postInitSpy = vi.fn(async () => {});
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      postInitialize: postInitSpy,
    };
    const instance = { alpha: { name: 'alpha' } };
    const ctx = makeCtx([mod]);
    await runPostInitializePhase(ctx, instance);
    expect(postInitSpy).toHaveBeenCalledOnce();
  });

  it('passes the full instance and module-specific instance to postInitialize()', async () => {
    const postInitSpy = vi.fn(
      async (_args: { modules: unknown; instance: unknown; ref?: unknown }) => {},
    );
    const provider = { name: 'alpha', version: '1.0.0' };
    const instance = { alpha: provider };
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      postInitialize: postInitSpy,
    };
    const ctx = makeCtx([mod]);
    await runPostInitializePhase(ctx, instance);
    const args = postInitSpy.mock.calls[0][0];
    expect(args.modules).toBe(instance);
    expect(args.instance).toBe(provider);
  });

  it('passes ref to postInitialize()', async () => {
    const postInitSpy = vi.fn(
      async (_args: { modules: unknown; instance: unknown; ref?: unknown }) => {},
    );
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      postInitialize: postInitSpy,
    };
    const ref = { parent: true };
    const ctx = makeCtx([mod]);
    await runPostInitializePhase(ctx, { alpha: {} }, ref);
    expect(postInitSpy.mock.calls[0][0].ref).toBe(ref);
  });

  it('skips modules with no postInitialize hook', async () => {
    const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
    const ctx = makeCtx([mod]);
    // Should not throw
    await expect(runPostInitializePhase(ctx, { alpha: {} })).resolves.toBeUndefined();
  });

  it('does not throw when postInitialize() fails — isolates failure', async () => {
    const failingMod: AnyModule = {
      name: 'bad',
      initialize: vi.fn(),
      postInitialize: vi.fn(async () => {
        throw new Error('post-init failed');
      }),
    };
    const goodMod: AnyModule = {
      name: 'good',
      initialize: vi.fn(),
      postInitialize: vi.fn(async () => {}),
    };
    const ctx = makeCtx([failingMod, goodMod]);
    await expect(runPostInitializePhase(ctx, { bad: {}, good: {} })).resolves.toBeUndefined();
    expect(goodMod.postInitialize).toHaveBeenCalledOnce();
  });

  it('runs afterInit callbacks with the instance', async () => {
    const afterInitSpy = vi.fn();
    const instance = { alpha: { name: 'alpha' } };
    const ctx = makeCtx([{ name: 'alpha', initialize: vi.fn() }], {
      afterInit: [afterInitSpy],
    });
    await runPostInitializePhase(ctx, instance);
    expect(afterInitSpy).toHaveBeenCalledWith(instance);
  });

  it('runs multiple afterInit callbacks', async () => {
    const spy1 = vi.fn();
    const spy2 = vi.fn();
    const instance = { alpha: {} };
    const ctx = makeCtx([{ name: 'alpha', initialize: vi.fn() }], {
      afterInit: [spy1, spy2],
    });
    await runPostInitializePhase(ctx, instance);
    expect(spy1).toHaveBeenCalledOnce();
    expect(spy2).toHaveBeenCalledOnce();
  });

  it('skips afterInit loop when array is empty', async () => {
    const mod: AnyModule = { name: 'alpha', initialize: vi.fn() };
    const ctx = makeCtx([mod]); // afterInit defaults to []
    await expect(runPostInitializePhase(ctx, { alpha: {} })).resolves.toBeUndefined();
  });

  it('emits postInitialized and complete events', async () => {
    const registerEvent = vi.fn<[ModuleEvent], void>();
    const mod: AnyModule = {
      name: 'alpha',
      initialize: vi.fn(),
      postInitialize: vi.fn(async () => {}),
    };
    const ctx = makeCtx([mod], { registerEvent });
    await runPostInitializePhase(ctx, { alpha: {} });
    const names = registerEvent.mock.calls.map(([e]) => e.name);
    expect(names).toContain(ModuleConfiguratorEventName.ModulePostInitializeComplete);
    expect(names).toContain(ModuleConfiguratorEventName.PostInitializeComplete);
  });
});
