import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';

import { reconcile, type ReconcileDeps } from '../reconcile';
import type { ReconcilerSourceEntry } from '../sources/types';
import type { ContextNavigationAdapter } from '../adapters/types';
import type { OwnNavigationTokens } from '../apply-navigation';

function makeContext(id: string): ContextItem {
  return { id, title: `Context ${id}` } as unknown as ContextItem;
}

function makeAdapter(overrides: Partial<ContextNavigationAdapter> = {}): ContextNavigationAdapter {
  return {
    id: 'test-adapter',
    canHandle: () => true,
    encode: ({ context, currentURL }) => {
      if (!context) return null;
      return new URL(`/apps/my-app/${context.id}`, currentURL.origin);
    },
    decode: () => null,
    ...overrides,
  };
}

function makeDeps(overrides: Partial<ReconcileDeps> = {}): ReconcileDeps {
  return {
    event: {
      dispatchEvent: vi.fn(async () => ({ canceled: false })),
    } as unknown as ReconcileDeps['event'],
    navigation: {
      path: { pathname: '/apps/my-app', search: '' },
      navigate: vi.fn(),
    } as unknown as ReconcileDeps['navigation'],
    config: {
      portalName: 'Test',
      origin: 'https://example.com',
      adapters: [makeAdapter()],
      enableUrlGuard: false,
      debug: false,
      sourceFactory: () => ({ subscribe: vi.fn() }) as never,
      navigationOptions: { replace: true },
    },
    eventSource: { name: 'contextNavigation', version: '0.0.0' },
    ownNavTokens: new Set() as OwnNavigationTokens,
    log: vi.fn(),
    ...overrides,
  };
}

describe('reconcile', () => {
  const appModules = {
    context: { currentContext: null },
  } as unknown as AppModulesInstance<[ContextModule]>;
  let deps: ReconcileDeps;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('dispatches no-context skip when contextState is undefined', () => {
    const entry: ReconcilerSourceEntry = { appKey: 'my-app', appModules, contextState: undefined };

    reconcile(entry, deps);

    expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
      'onContextNavigationSkipped',
      expect.objectContaining({ detail: { appKey: 'my-app', reason: 'no-context' } }),
    );
  });

  it('navigates to nullContextUrl when contextState is null and config provides it', () => {
    const nullContextUrl = vi.fn(() => '/apps/my-app');
    deps = makeDeps();
    deps.config = { ...deps.config, nullContextUrl };
    Object.assign(deps.navigation, {
      path: { pathname: '/apps/my-app/old-ctx', search: '' },
    });

    const entry: ReconcilerSourceEntry = { appKey: 'my-app', appModules, contextState: null };

    reconcile(entry, deps);

    expect(nullContextUrl).toHaveBeenCalledWith(expect.objectContaining({ appKey: 'my-app' }));
    expect(deps.navigation.navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/apps/my-app' }),
      expect.anything(),
    );
    expect(deps.ownNavTokens.has('/apps/my-app')).toBe(true);
  });

  it('does not navigate when nullContextUrl produces the same path', () => {
    const nullContextUrl = vi.fn(() => '/apps/my-app');
    deps = makeDeps();
    deps.config = { ...deps.config, nullContextUrl };

    const entry: ReconcilerSourceEntry = { appKey: 'my-app', appModules, contextState: null };

    reconcile(entry, deps);

    expect(deps.navigation.navigate).not.toHaveBeenCalled();
  });

  it('dispatches no-adapter skip when no adapter matches', () => {
    const noMatchAdapter = makeAdapter({ canHandle: () => false });
    deps = makeDeps();
    deps.config = { ...deps.config, adapters: [noMatchAdapter] };

    const entry: ReconcilerSourceEntry = {
      appKey: 'my-app',
      appModules,
      contextState: makeContext('ctx-1'),
    };

    reconcile(entry, deps);

    expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
      'onContextNavigationSkipped',
      expect.objectContaining({ detail: { appKey: 'my-app', reason: 'no-adapter' } }),
    );
  });

  it('dispatches adapter-resolved event and triggers navigation', async () => {
    const entry: ReconcilerSourceEntry = {
      appKey: 'my-app',
      appModules,
      contextState: makeContext('ctx-1'),
    };

    reconcile(entry, deps);

    await vi.waitFor(() => {
      expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
        'onContextNavigationAdapterResolved',
        expect.objectContaining({ detail: { appKey: 'my-app', adapterId: 'test-adapter' } }),
      );
      expect(deps.navigation.navigate).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/apps/my-app/ctx-1' }),
        { replace: true },
      );
    });
  });

  it('strips all query params on app switch', async () => {
    // Adapter that carries currentURL.search through to its output
    const adapter = makeAdapter({
      encode: ({ context, currentURL }) => {
        if (!context) return null;
        const url = new URL(`/apps/new-app/${context.id}`, currentURL.origin);
        url.search = currentURL.search;
        return url;
      },
    });
    deps = makeDeps();
    deps.config = { ...deps.config, adapters: [adapter] };
    Object.assign(deps.navigation, {
      path: { pathname: '/apps/old-app/ctx-1', search: '?tab=settings&$contextId=ctx-1' },
    });

    const entry: ReconcilerSourceEntry = {
      appKey: 'new-app',
      appModules,
      contextState: makeContext('ctx-2'),
    };

    reconcile(entry, deps, { isAppSwitch: true });

    await vi.waitFor(() => {
      const navigatedURL = vi.mocked(deps.navigation.navigate).mock.calls[0]?.[0] as URL;
      // All query params from the previous app should be gone
      expect(navigatedURL.search).toBe('');
    });
  });

  it('preserves query params on context change within the same app', async () => {
    const adapter = makeAdapter({
      encode: ({ context, currentURL }) => {
        if (!context) return null;
        const url = new URL(`/apps/my-app/${context.id}`, currentURL.origin);
        url.search = currentURL.search;
        return url;
      },
    });
    deps = makeDeps();
    deps.config = { ...deps.config, adapters: [adapter] };
    Object.assign(deps.navigation, {
      path: { pathname: '/apps/my-app/ctx-1', search: '?tab=settings' },
    });

    const entry: ReconcilerSourceEntry = {
      appKey: 'my-app',
      appModules,
      contextState: makeContext('ctx-2'),
    };

    // Context change within the same app — query params should survive
    reconcile(entry, deps);

    await vi.waitFor(() => {
      const navigatedURL = vi.mocked(deps.navigation.navigate).mock.calls[0]?.[0] as URL;
      // App-specific param should survive on context change
      expect(navigatedURL.searchParams.get('tab')).toBe('settings');
    });
  });
});
