import { BehaviorSubject, EMPTY, Subject } from 'rxjs';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import type {
  ContextNavigationAdapter,
  ContextNavigationConfig,
  ReconcilerSourceEntry,
} from '../types';
import { createContextNavigationPlugin, type ContextNavigationPluginArgs } from '../plugin';

// ── Test Helpers ────────────────────────────────────────────────────────

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

interface TestHarness {
  source$: Subject<ReconcilerSourceEntry>;
  navigation: ContextNavigationPluginArgs['navigation'];
  event: ContextNavigationPluginArgs['event'];
  context: ContextNavigationPluginArgs['context'];
  app: ContextNavigationPluginArgs['app'];
  config: ContextNavigationConfig;
  teardown: () => void;
}

function createHarness(configOverrides: Partial<ContextNavigationConfig> = {}): TestHarness {
  const source$ = new Subject<ReconcilerSourceEntry>();
  const navigationState$ = new BehaviorSubject({});

  const navigation = {
    path: { pathname: '/apps/my-app', search: '' },
    navigate: vi.fn(),
    state$: navigationState$,
  } as unknown as ContextNavigationPluginArgs['navigation'];

  const event = {
    dispatchEvent: vi.fn(async () => ({ canceled: false })),
  } as unknown as ContextNavigationPluginArgs['event'];

  const context = {
    currentContext$: EMPTY,
    setCurrentContextByIdAsync: vi.fn(async () => undefined),
  } as unknown as ContextNavigationPluginArgs['context'];

  const app = {
    current$: EMPTY,
  } as unknown as ContextNavigationPluginArgs['app'];

  const config: ContextNavigationConfig = {
    portalName: 'TestPortal',
    origin: 'https://example.com',
    adapters: [makeAdapter()],
    enableUrlGuard: false,
    debug: false,
    sourceFactory: () => source$,
    navigationOptions: { replace: true },
    ...configOverrides,
  };

  const teardown = createContextNavigationPlugin({ app, navigation, context, event, config });

  return { source$, navigation, event, context, app, config, teardown };
}

// ── Tests ───────────────────────────────────────────────────────────────

describe('createContextNavigationPlugin', () => {
  let harness: TestHarness;

  afterEach(() => {
    harness?.teardown();
  });

  // ─── Adapter Resolution ───────────────────────────────────────────

  describe('adapter resolution', () => {
    it('selects the first adapter whose canHandle returns true', async () => {
      const adapterA = makeAdapter({ id: 'adapter-a', canHandle: () => false });
      const adapterB = makeAdapter({ id: 'adapter-b', canHandle: () => true });

      harness = createHarness({ adapters: [adapterA, adapterB] });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;
      const ctx = makeContext('ctx-1');

      harness.source$.next({ appKey: 'my-app', appModules, contextState: ctx });
      await vi.waitFor(() => {
        expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
          'onContextNavigationAdapterResolved',
          expect.objectContaining({
            detail: { appKey: 'my-app', adapterId: 'adapter-b' },
          }),
        );
      });
    });

    it('dispatches no-adapter skip when no adapter matches', () => {
      const adapterA = makeAdapter({ id: 'never', canHandle: () => false });
      harness = createHarness({ adapters: [adapterA] });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('x') });

      expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
        'onContextNavigationSkipped',
        expect.objectContaining({
          detail: { appKey: 'my-app', reason: 'no-adapter' },
        }),
      );
    });

    it('supports factory-style adapters', async () => {
      const factoryAdapter = makeAdapter({ id: 'factory-based' });
      const factory = vi.fn(() => factoryAdapter);
      harness = createHarness({ adapters: [factory] });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('c1') });

      await vi.waitFor(() => {
        expect(factory).toHaveBeenCalledWith(expect.objectContaining({ appKey: 'my-app' }));
        expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
          'onContextNavigationAdapterResolved',
          expect.objectContaining({ detail: { appKey: 'my-app', adapterId: 'factory-based' } }),
        );
      });
    });
  });

  // ─── Skip Reasons ─────────────────────────────────────────────────

  describe('skip reasons', () => {
    it('skips with no-context when contextState is undefined', () => {
      harness = createHarness();
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: undefined });

      expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
        'onContextNavigationSkipped',
        expect.objectContaining({
          detail: { appKey: 'my-app', reason: 'no-context' },
        }),
      );
    });

    it('skips with url-matches when target URL equals current URL', () => {
      // Adapter encodes to /apps/my-app/<id>. Set current path to match.
      harness = createHarness();
      Object.assign(harness.navigation, {
        path: { pathname: '/apps/my-app/ctx-1', search: '' },
      });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('ctx-1') });

      expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
        'onContextNavigationSkipped',
        expect.objectContaining({
          detail: { appKey: 'my-app', reason: 'url-matches' },
        }),
      );
    });

    it('skips with encode-returned-null when adapter encode returns null', () => {
      const nullEncoder = makeAdapter({
        id: 'null-encoder',
        encode: () => null,
      });
      harness = createHarness({ adapters: [nullEncoder] });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('x') });

      expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
        'onContextNavigationSkipped',
        expect.objectContaining({
          detail: { appKey: 'my-app', reason: 'encode-returned-null' },
        }),
      );
    });

    it('skips with canceled when navigation event is canceled', async () => {
      harness = createHarness();
      vi.mocked(harness.event.dispatchEvent).mockImplementation(async (name: unknown) => {
        if (name === 'onContextNavigationNavigate') return { canceled: true } as never;
        return { canceled: false } as never;
      });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('ctx-2') });

      await vi.waitFor(() => {
        expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
          'onContextNavigationSkipped',
          expect.objectContaining({
            detail: { appKey: 'my-app', reason: 'canceled' },
          }),
        );
      });
    });
  });

  // ─── Navigation Behavior ──────────────────────────────────────────

  describe('navigation behavior', () => {
    it('navigates with config.navigationOptions', async () => {
      harness = createHarness({ navigationOptions: { replace: true } });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('ctx-1') });

      await vi.waitFor(() => {
        expect(harness.navigation.navigate).toHaveBeenCalledWith(expect.any(URL), {
          replace: true,
        });
      });
    });

    it('dispatches onContextNavigationNavigated after successful navigation', async () => {
      harness = createHarness();
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;
      const ctx = makeContext('ctx-1');

      harness.source$.next({ appKey: 'my-app', appModules, contextState: ctx });

      await vi.waitFor(() => {
        expect(harness.event.dispatchEvent).toHaveBeenCalledWith(
          'onContextNavigationNavigated',
          expect.objectContaining({
            detail: expect.objectContaining({
              appKey: 'my-app',
              adapterId: 'test-adapter',
              context: ctx,
            }),
          }),
        );
      });
    });

    it('calls onTransition callback after navigation', async () => {
      const onTransition = vi.fn();
      harness = createHarness({ onTransition });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('ctx-1') });

      await vi.waitFor(() => {
        expect(onTransition).toHaveBeenCalledWith(
          expect.objectContaining({ appKey: 'my-app', adapterId: 'test-adapter' }),
        );
      });
    });
  });

  // ─── Hash/Query Preservation ──────────────────────────────────────

  describe('hash and query preservation', () => {
    it('preserves query parameters from the current URL', async () => {
      const adapter = makeAdapter({
        encode: ({ context, currentURL }) => {
          if (!context) return null;
          const target = new URL(`/apps/my-app/${context.id}`, currentURL.origin);
          target.search = currentURL.search;
          return target;
        },
      });
      harness = createHarness({ adapters: [adapter] });
      Object.assign(harness.navigation, {
        path: { pathname: '/apps/my-app', search: '?view=grid&page=2' },
      });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('ctx-5') });

      await vi.waitFor(() => {
        const navigateCall = vi.mocked(harness.navigation.navigate).mock.calls[0];
        const targetURL = navigateCall?.[0] as URL;
        expect(targetURL.search).toBe('?view=grid&page=2');
        expect(targetURL.pathname).toBe('/apps/my-app/ctx-5');
      });
    });
  });

  // ─── Null Context URL ─────────────────────────────────────────────

  describe('null context handling', () => {
    it('navigates to nullContextUrl when context is null', () => {
      const nullContextUrl = vi.fn(() => '/apps/my-app');
      harness = createHarness({ nullContextUrl });
      Object.assign(harness.navigation, {
        path: { pathname: '/apps/my-app/some-context', search: '' },
      });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: null });

      expect(nullContextUrl).toHaveBeenCalledWith(expect.objectContaining({ appKey: 'my-app' }));
      expect(harness.navigation.navigate).toHaveBeenCalledWith(
        expect.objectContaining({ pathname: '/apps/my-app' }),
        expect.anything(),
      );
    });

    it('does not navigate when nullContextUrl produces same path', () => {
      const nullContextUrl = vi.fn(() => '/apps/my-app');
      harness = createHarness({ nullContextUrl });
      Object.assign(harness.navigation, {
        path: { pathname: '/apps/my-app', search: '' },
      });
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.source$.next({ appKey: 'my-app', appModules, contextState: null });

      expect(harness.navigation.navigate).not.toHaveBeenCalled();
    });
  });

  // ─── URL Guard (Push Mode) ────────────────────────────────────────

  describe('URL guard — push mode', () => {
    it('sets context from URL when URL has different context ID in push mode', async () => {
      const adapter = makeAdapter();
      const navigationState$ = new Subject<unknown>();
      const appModules = {
        context: { currentContext: makeContext('active-ctx') },
      } as unknown as AppModulesInstance<[ContextModule]>;

      const currentApp$ = new BehaviorSubject({
        appKey: 'my-app',
        instance$: new BehaviorSubject(appModules),
      });

      const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
      const navigation = {
        path: { pathname: '/apps/my-app/url-ctx', search: '' },
        navigate: vi.fn(),
        state$: navigationState$,
      } as unknown as ContextNavigationPluginArgs['navigation'];

      const context = {
        setCurrentContextByIdAsync: vi.fn(async () => undefined),
      } as unknown as ContextNavigationPluginArgs['context'];

      const event = {
        dispatchEvent: vi.fn(async () => ({ canceled: false })),
      } as unknown as ContextNavigationPluginArgs['event'];

      const config: ContextNavigationConfig = {
        portalName: 'TestPortal',
        origin: 'https://example.com',
        adapters: [adapter],
        enableUrlGuard: true,
        debug: false,
        sourceFactory: () => EMPTY,
        navigationOptions: { replace: false },
      };

      const teardown = createContextNavigationPlugin({ app, navigation, context, event, config });

      // Trigger URL guard by emitting a navigation state change
      navigationState$.next({});

      await vi.waitFor(() => {
        expect(context.setCurrentContextByIdAsync).toHaveBeenCalledWith('url-ctx');
      });

      teardown();
    });

    it('re-asserts active context when URL context resolution fails in push mode', async () => {
      const adapter = makeAdapter();
      const navigationState$ = new Subject<unknown>();
      const activeContext = makeContext('active-ctx');
      const appModules = {
        context: { currentContext: activeContext },
      } as unknown as AppModulesInstance<[ContextModule]>;

      const currentApp$ = new BehaviorSubject({
        appKey: 'my-app',
        instance$: new BehaviorSubject(appModules),
      });

      const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
      const navigation = {
        path: { pathname: '/apps/my-app/stale-ctx', search: '' },
        navigate: vi.fn(),
        state$: navigationState$,
      } as unknown as ContextNavigationPluginArgs['navigation'];

      const context = {
        setCurrentContextByIdAsync: vi.fn(async () => {
          throw new Error('Context not found');
        }),
      } as unknown as ContextNavigationPluginArgs['context'];

      const event = {
        dispatchEvent: vi.fn(async () => ({ canceled: false })),
      } as unknown as ContextNavigationPluginArgs['event'];

      const config: ContextNavigationConfig = {
        portalName: 'TestPortal',
        origin: 'https://example.com',
        adapters: [adapter],
        enableUrlGuard: true,
        debug: false,
        sourceFactory: () => EMPTY,
        navigationOptions: { replace: false },
      };

      const teardown = createContextNavigationPlugin({ app, navigation, context, event, config });
      navigationState$.next({});

      await vi.waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: '/apps/my-app/active-ctx' }),
          expect.anything(),
        );
      });

      teardown();
    });
  });

  // ─── URL Guard (Replace Mode) ────────────────────────────────────

  describe('URL guard — replace mode', () => {
    it('re-asserts active context when URL diverges in replace mode', async () => {
      const adapter = makeAdapter();
      const navigationState$ = new Subject<unknown>();
      const activeContext = makeContext('active-ctx');
      const appModules = {
        context: { currentContext: activeContext },
      } as unknown as AppModulesInstance<[ContextModule]>;

      const currentApp$ = new BehaviorSubject({
        appKey: 'my-app',
        instance$: new BehaviorSubject(appModules),
      });

      const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
      const navigation = {
        path: { pathname: '/apps/my-app/wrong-ctx', search: '' },
        navigate: vi.fn(),
        state$: navigationState$,
      } as unknown as ContextNavigationPluginArgs['navigation'];

      const context = {
        setCurrentContextByIdAsync: vi.fn(async () => undefined),
      } as unknown as ContextNavigationPluginArgs['context'];

      const event = {
        dispatchEvent: vi.fn(async () => ({ canceled: false })),
      } as unknown as ContextNavigationPluginArgs['event'];

      const config: ContextNavigationConfig = {
        portalName: 'TestPortal',
        origin: 'https://example.com',
        adapters: [adapter],
        enableUrlGuard: true,
        debug: false,
        sourceFactory: () => EMPTY,
        navigationOptions: { replace: true },
      };

      const teardown = createContextNavigationPlugin({ app, navigation, context, event, config });
      navigationState$.next({});

      await vi.waitFor(() => {
        expect(navigation.navigate).toHaveBeenCalledWith(
          expect.objectContaining({ pathname: '/apps/my-app/active-ctx' }),
          { replace: true },
        );
      });

      teardown();
    });

    it('ignores navigation state changes for URLs outside the app base path', async () => {
      const adapter = makeAdapter();
      const navigationState$ = new Subject<unknown>();
      const appModules = {
        context: { currentContext: makeContext('active-ctx') },
      } as unknown as AppModulesInstance<[ContextModule]>;

      const currentApp$ = new BehaviorSubject({
        appKey: 'my-app',
        instance$: new BehaviorSubject(appModules),
      });

      const app = { current$: currentApp$ } as unknown as ContextNavigationPluginArgs['app'];
      const navigation = {
        path: { pathname: '/apps/other-app/something', search: '' },
        navigate: vi.fn(),
        state$: navigationState$,
      } as unknown as ContextNavigationPluginArgs['navigation'];

      const event = {
        dispatchEvent: vi.fn(async () => ({ canceled: false })),
      } as unknown as ContextNavigationPluginArgs['event'];

      const context = {
        setCurrentContextByIdAsync: vi.fn(async () => undefined),
      } as unknown as ContextNavigationPluginArgs['context'];

      const config: ContextNavigationConfig = {
        portalName: 'TestPortal',
        origin: 'https://example.com',
        adapters: [adapter],
        enableUrlGuard: true,
        debug: false,
        sourceFactory: () => EMPTY,
        navigationOptions: { replace: true },
      };

      const teardown = createContextNavigationPlugin({ app, navigation, context, event, config });
      navigationState$.next({});

      // Wait a tick and verify no navigation occurred
      await new Promise((r) => setTimeout(r, 50));
      expect(navigation.navigate).not.toHaveBeenCalled();
      expect(context.setCurrentContextByIdAsync).not.toHaveBeenCalled();

      teardown();
    });
  });

  // ─── Teardown ─────────────────────────────────────────────────────

  describe('teardown', () => {
    it('unsubscribes from source on teardown', () => {
      harness = createHarness();
      const appModules = { context: { currentContext: null } } as unknown as AppModulesInstance<
        [ContextModule]
      >;

      harness.teardown();

      // After teardown, emitting should not cause dispatches
      harness.source$.next({ appKey: 'my-app', appModules, contextState: makeContext('x') });
      expect(harness.event.dispatchEvent).not.toHaveBeenCalled();
    });
  });
});
