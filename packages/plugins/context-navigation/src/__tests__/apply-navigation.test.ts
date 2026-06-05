import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';

import {
  applyNavigation,
  type ApplyNavigationDeps,
  type ApplyNavigationPayload,
  type OwnNavigationTokens,
} from '../apply-navigation';
import type { ContextNavigationAdapter } from '../adapters/types';

function makeContext(id: string): ContextItem {
  return { id, title: `Context ${id}` } as unknown as ContextItem;
}

function makeAdapter(overrides: Partial<ContextNavigationAdapter> = {}): ContextNavigationAdapter {
  return {
    id: 'test-adapter',
    canHandle: () => true,
    encode: ({ context, currentURL }) => {
      if (!context) return null;
      return new URL(`/apps/my-app/${context.id}${currentURL.search}`, currentURL.origin);
    },
    decode: (url) => {
      const match = url.pathname.match(/\/apps\/my-app\/([^/]+)/);
      return match?.[1] ?? null;
    },
    ...overrides,
  };
}

function makeDeps(overrides: Partial<ApplyNavigationDeps> = {}): ApplyNavigationDeps {
  return {
    event: {
      dispatchEvent: vi.fn(async () => ({ canceled: false })),
    } as unknown as ApplyNavigationDeps['event'],
    navigation: { navigate: vi.fn() } as unknown as ApplyNavigationDeps['navigation'],
    config: {
      portalName: 'Test',
      origin: 'https://example.com',
      adapters: [],
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

describe('applyNavigation', () => {
  const currentURL = new URL('/apps/my-app', 'https://example.com');
  const appModules = { context: {} } as unknown as AppModulesInstance<[ContextModule]>;
  let deps: ApplyNavigationDeps;

  beforeEach(() => {
    deps = makeDeps();
  });

  it('dispatches encode-returned-null skip when adapter returns null', async () => {
    const adapter = makeAdapter({ encode: () => null });
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    await applyNavigation(payload, deps);

    expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
      'onContextNavigationSkipped',
      expect.objectContaining({ detail: { appKey: 'my-app', reason: 'encode-returned-null' } }),
    );
    expect(deps.navigation.navigate).not.toHaveBeenCalled();
  });

  it('dispatches url-matches skip when target equals current URL', async () => {
    const adapter = makeAdapter({
      encode: ({ currentURL: url }) => new URL(url.pathname, url.origin),
    });
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    await applyNavigation(payload, deps);

    expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
      'onContextNavigationSkipped',
      expect.objectContaining({ detail: { appKey: 'my-app', reason: 'url-matches' } }),
    );
  });

  it('navigates and records own-nav token on success', async () => {
    const adapter = makeAdapter();
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    await applyNavigation(payload, deps);

    expect(deps.navigation.navigate).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: '/apps/my-app/ctx-1' }),
      { replace: true },
    );
    expect(deps.ownNavTokens.has('/apps/my-app/ctx-1')).toBe(true);
  });

  it('dispatches canceled skip when navigate event is canceled', async () => {
    deps = makeDeps({
      event: {
        dispatchEvent: vi.fn(async (name) => ({
          canceled: name === 'onContextNavigationNavigate',
        })),
      } as unknown as ApplyNavigationDeps['event'],
    });
    const adapter = makeAdapter();
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    await applyNavigation(payload, deps);

    expect(deps.event.dispatchEvent).toHaveBeenCalledWith(
      'onContextNavigationSkipped',
      expect.objectContaining({ detail: { appKey: 'my-app', reason: 'canceled' } }),
    );
    expect(deps.navigation.navigate).not.toHaveBeenCalled();
  });

  it('logs and does not throw when dispatch rejects', async () => {
    deps = makeDeps({
      event: {
        dispatchEvent: vi.fn(async () => {
          throw new Error('dispatch failure');
        }),
      } as unknown as ApplyNavigationDeps['event'],
    });
    const adapter = makeAdapter();
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    // Should not reject — the .catch() handles it.
    await expect(applyNavigation(payload, deps)).resolves.toBeUndefined();
    expect(deps.log).toHaveBeenCalledWith(expect.stringContaining('dispatch failure'));
  });

  it('calls onTransition callback after navigation', async () => {
    const onTransition = vi.fn();
    deps = makeDeps();
    deps.config = { ...deps.config, onTransition };
    const adapter = makeAdapter();
    const payload: ApplyNavigationPayload = {
      appKey: 'my-app',
      appModules,
      adapter,
      context: makeContext('ctx-1'),
      currentURL,
    };

    await applyNavigation(payload, deps);

    expect(onTransition).toHaveBeenCalledWith(
      expect.objectContaining({ appKey: 'my-app', adapterId: 'test-adapter' }),
    );
  });
});
