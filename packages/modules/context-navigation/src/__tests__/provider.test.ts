import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Subject, BehaviorSubject, of, EMPTY } from 'rxjs';

import { ContextNavigationProvider } from '../provider';
import type { ContextNavigationProviderArgs } from '../provider';
import type {
  ContextNavigationConfig,
  ContextNavigationSourceEmission,
  TelemetryTracker,
} from '../types';
import type { IContextProvider, ContextItem } from '@equinor/fusion-framework-module-context';
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextModule } from '@equinor/fusion-framework-module-context';
import type { RoutingExecutionMode } from '../orchestrator/routing-mode-orchestrator';

// ─── Test helpers ────────────────────────────────────────────────────

/** Flush microtasks so RxJS `tap` side effects execute. */
const flush = () => new Promise<void>((r) => setTimeout(r, 0));

/** Build a minimal mock IContextProvider with sensible defaults. */
function createMockContextProvider(
  overrides: Partial<IContextProvider> & { version?: string } = {},
): IContextProvider {
  return {
    currentContext: null,
    currentContext$: new BehaviorSubject<ContextItem | null>(null),
    // The orchestrator reads `provider.version` (via mergeContextProviders)
    // and semver-coerces it to detect legacy vs modern.
    version: '8.1.0',
    routingStrategy: 'query',
    contextFilter: [],
    queryContext: vi.fn(),
    setCurrentContext: vi.fn(),
    clearCurrentContext: vi.fn(),
    resolveContext: vi.fn(),
    ...overrides,
  } as unknown as IContextProvider;
}

/** Minimal mock navigation provider. */
function createMockNavigation(pathname = '/apps/test-app', search = '') {
  const stateSubject = new Subject<unknown>();
  return {
    path: { pathname, search, hash: '' },
    state$: stateSubject,
    navigate: vi.fn(),
    replace: vi.fn(),
    createURL: vi.fn(({ pathname: p }: { pathname: string }) => new URL(`http://localhost${p}`)),
    version: { major: 10, minor: 0, patch: 0 },
    _stateSubject: stateSubject,
  };
}

/** Minimal mock AppModulesInstance with context (and optionally navigation). */
function createMockAppModules(
  contextProvider?: IContextProvider,
  navigation?: ReturnType<typeof createMockNavigation>,
): AppModulesInstance<[ContextModule]> {
  return {
    context: contextProvider ?? createMockContextProvider(),
    navigation,
  } as unknown as AppModulesInstance<[ContextModule]>;
}

/** Telemetry spy. */
function createMockTelemetry(): TelemetryTracker & { trackEvent: ReturnType<typeof vi.fn> } {
  return { trackEvent: vi.fn() };
}

/** Default config factory — all features enabled, controlled source. */
function createConfig(
  sourceSubject: Subject<ContextNavigationSourceEmission>,
  overrides: Partial<ContextNavigationConfig> = {},
): ContextNavigationConfig {
  return {
    portalName: 'TestPortal',
    sourceFactory: () => sourceSubject.asObservable(),
    enableAppSwitchCarryOver: true,
    enableContextUrlGuard: false, // off by default — tested explicitly
    warnOnStrategies: [],
    consoleDebug: false,
    ...overrides,
  };
}

const CONTEXT_ITEM: ContextItem = { id: 'ctx-123', title: 'Test Context' } as ContextItem;

// ─── Tests ───────────────────────────────────────────────────────────

describe('ContextNavigationProvider', () => {
  let provider: ContextNavigationProvider;

  afterEach(() => {
    provider?.dispose();
  });

  // ── Construction & disposal ────────────────────────────────────────

  describe('construction & disposal', () => {
    it('constructs without throwing', () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation();
      const app = { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'];
      const ctx = createMockContextProvider();

      provider = new ContextNavigationProvider({
        app,
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: ctx,
        config: createConfig(source$),
      });

      expect(provider).toBeDefined();
    });

    it('dispose unsubscribes — source emissions after dispose have no effect', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation();
      const appContextProvider = createMockContextProvider({ routingStrategy: 'query' });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$),
      });

      provider.dispose();

      // Emit after dispose — navigate should NOT be called
      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Subscription 1: Context-change sync ────────────────────────────

  describe('context-change sync', () => {
    it('navigates when context changes with query strategy', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(nav.navigate).toHaveBeenCalledTimes(1);
      const [navPath] = nav.navigate.mock.calls[0];
      expect(navPath.search).toContain('$contextId=ctx-123');
    });

    it('navigates when context changes with path strategy', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'path',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(nav.navigate).toHaveBeenCalledTimes(1);
      const [navPath] = nav.navigate.mock.calls[0];
      expect(navPath.pathname).toContain('ctx-123');
    });

    it('skips navigation when context is undefined (still initializing)', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation();
      const appModules = createMockAppModules();

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$),
      });

      source$.next({ appModules, appKey: 'test-app', context: undefined });
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('invokes nullContextHandler when context is null', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app/ctx-123', '');
      const nullContextHandler = vi.fn().mockReturnValue({ pathname: '/apps/test-app/' });
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { nullContextHandler }),
      });

      source$.next({ appModules, appKey: 'test-app', context: null });
      await flush();

      expect(nullContextHandler).toHaveBeenCalledOnce();
      expect(nullContextHandler).toHaveBeenCalledWith(
        expect.objectContaining({ appKey: 'test-app' }),
      );
      expect(nav.navigate).toHaveBeenCalledTimes(1);
    });

    it('falls through to orchestrator when nullContextHandler returns undefined', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app/ctx-123', '');
      const nullContextHandler = vi.fn().mockReturnValue(undefined);
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { nullContextHandler }),
      });

      source$.next({ appModules, appKey: 'test-app', context: null });
      await flush();

      expect(nullContextHandler).toHaveBeenCalledOnce();
      // Orchestrator should still process — navigate may or may not be called
      // depending on orchestrator result, but nullContextHandler was invoked
    });

    it('fires onStrategyDetected for custom strategy (no instruction)', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const onStrategyDetected = vi.fn();
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'custom',
      });
      // Custom strategy requires app-owned context provider
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { onStrategyDetected }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(onStrategyDetected).toHaveBeenCalledWith('test-app', 'custom');
    });
  });

  // ── Telemetry ──────────────────────────────────────────────────────

  describe('telemetry', () => {
    it('tracks context-change events when telemetry is provided', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const telemetry = createMockTelemetry();
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { telemetry }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(telemetry.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'context-navigation.context-change',
          properties: expect.objectContaining({
            appKey: 'test-app',
            mode: 'query',
          }),
        }),
      );
    });

    it('does not throw when telemetry is not provided', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$),
      });

      // Should not throw
      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();
    });

    it('prefers config telemetry over args telemetry', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const configTelemetry = createMockTelemetry();
      const argsTelemetry = createMockTelemetry();
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { telemetry: configTelemetry }),
        telemetry: argsTelemetry,
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(configTelemetry.trackEvent).toHaveBeenCalled();
      expect(argsTelemetry.trackEvent).not.toHaveBeenCalled();
    });
  });

  // ── Strategy warnings ──────────────────────────────────────────────

  describe('strategy warnings', () => {
    it('warns on custom strategy when included in warnOnStrategies', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'custom',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { warnOnStrategies: ['custom'] }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(warnSpy).toHaveBeenCalledWith(
        expect.stringContaining('TestPortal'),
        expect.stringContaining('custom'),
      );
      warnSpy.mockRestore();
    });

    it('does not warn when strategy is not in warnOnStrategies', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { warnOnStrategies: ['custom'] }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(warnSpy).not.toHaveBeenCalled();
      warnSpy.mockRestore();
    });
  });

  // ── Subscription 2: App-switch carry-over ──────────────────────────

  describe('app-switch carry-over', () => {
    it('carries context to new app on app switch', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/app-a', '');
      const currentApp$ = new Subject<{ appKey: string; instance$: typeof EMPTY } | null>();
      const portalContext = createMockContextProvider({
        currentContext: CONTEXT_ITEM,
      });

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: portalContext,
        config: createConfig(source$, { enableAppSwitchCarryOver: true }),
      });

      // First emission — sets previousAppKey
      currentApp$.next({ appKey: 'app-a', instance$: EMPTY });
      await flush();

      // Switch to app-b — should carry context
      nav.path.pathname = '/apps/app-b';
      currentApp$.next({ appKey: 'app-b', instance$: EMPTY });
      await flush();

      expect(nav.navigate).toHaveBeenCalledTimes(1);
      const [navPath, opts] = nav.navigate.mock.calls[0];
      expect(navPath.pathname).toContain('app-b');
      expect(navPath.pathname).toContain('ctx-123');
      expect(opts).toEqual({ replace: true });
    });

    it('does not carry context when disabled', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/app-a', '');
      const currentApp$ = new Subject<{ appKey: string; instance$: typeof EMPTY } | null>();

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: CONTEXT_ITEM }),
        config: createConfig(source$, { enableAppSwitchCarryOver: false }),
      });

      currentApp$.next({ appKey: 'app-a', instance$: EMPTY });
      await flush();
      currentApp$.next({ appKey: 'app-b', instance$: EMPTY });
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('skips carry-over when no context is active', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/app-a', '');
      const currentApp$ = new Subject<{ appKey: string; instance$: typeof EMPTY } | null>();

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: null }),
        config: createConfig(source$, { enableAppSwitchCarryOver: true }),
      });

      currentApp$.next({ appKey: 'app-a', instance$: EMPTY });
      await flush();
      nav.path.pathname = '/apps/app-b';
      currentApp$.next({ appKey: 'app-b', instance$: EMPTY });
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('skips when context already present in target URL', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/app-b/ctx-123', '');
      const currentApp$ = new Subject<{ appKey: string; instance$: typeof EMPTY } | null>();

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: CONTEXT_ITEM }),
        config: createConfig(source$, { enableAppSwitchCarryOver: true }),
      });

      currentApp$.next({ appKey: 'app-a', instance$: EMPTY });
      await flush();
      currentApp$.next({ appKey: 'app-b', instance$: EMPTY });
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('tracks telemetry on app switch', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/app-a', '');
      const telemetry = createMockTelemetry();
      const currentApp$ = new Subject<{ appKey: string; instance$: typeof EMPTY } | null>();

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: CONTEXT_ITEM }),
        config: createConfig(source$, { enableAppSwitchCarryOver: true, telemetry }),
      });

      currentApp$.next({ appKey: 'app-a', instance$: EMPTY });
      await flush();
      nav.path.pathname = '/apps/app-b';
      currentApp$.next({ appKey: 'app-b', instance$: EMPTY });
      await flush();

      expect(telemetry.trackEvent).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'context-navigation.app-switch',
          properties: expect.objectContaining({
            appKey: 'app-b',
            contextId: 'ctx-123',
          }),
        }),
      );
    });
  });

  // ── Subscription 3: Context URL guard ──────────────────────────────

  describe('context URL guard', () => {
    it('re-applies context when missing from URL', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      const instanceSubject = new BehaviorSubject<AppModulesInstance<[ContextModule]> | null>(
        appModules,
      );
      const currentApp$ = new BehaviorSubject<{
        appKey: string;
        instance$: typeof instanceSubject;
      } | null>({ appKey: 'test-app', instance$: instanceSubject });

      const portalContext = createMockContextProvider({ currentContext: CONTEXT_ITEM });

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: portalContext,
        config: createConfig(source$, {
          enableContextUrlGuard: true,
          enableAppSwitchCarryOver: false,
        }),
      });

      // Simulate URL change without context
      nav._stateSubject.next({});
      await flush();

      expect(nav.navigate).toHaveBeenCalled();
    });

    it('does not interfere with custom strategy apps', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'custom',
      });
      const appModules = createMockAppModules(appContextProvider);

      const instanceSubject = new BehaviorSubject<AppModulesInstance<[ContextModule]> | null>(
        appModules,
      );
      const currentApp$ = new BehaviorSubject<{
        appKey: string;
        instance$: typeof instanceSubject;
      } | null>({ appKey: 'test-app', instance$: instanceSubject });

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: CONTEXT_ITEM }),
        config: createConfig(source$, {
          enableContextUrlGuard: true,
          enableAppSwitchCarryOver: false,
        }),
      });

      nav._stateSubject.next({});
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('skips when no context is active', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appModules = createMockAppModules(
      );

      const instanceSubject = new BehaviorSubject<AppModulesInstance<[ContextModule]> | null>(
        appModules,
      );
      const currentApp$ = new BehaviorSubject<{
        appKey: string;
        instance$: typeof instanceSubject;
      } | null>({ appKey: 'test-app', instance$: instanceSubject });

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: null }),
        config: createConfig(source$, {
          enableContextUrlGuard: true,
          enableAppSwitchCarryOver: false,
        }),
      });

      nav._stateSubject.next({});
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });

    it('is not set up when disabled', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const appModules = createMockAppModules(
      );

      const instanceSubject = new BehaviorSubject<AppModulesInstance<[ContextModule]> | null>(
        appModules,
      );
      const currentApp$ = new BehaviorSubject<{
        appKey: string;
        instance$: typeof instanceSubject;
      } | null>({ appKey: 'test-app', instance$: instanceSubject });

      provider = new ContextNavigationProvider({
        app: { current$: currentApp$ } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider({ currentContext: CONTEXT_ITEM }),
        config: createConfig(source$, {
          enableContextUrlGuard: false,
          enableAppSwitchCarryOver: false,
        }),
      });

      nav._stateSubject.next({});
      await flush();

      expect(nav.navigate).not.toHaveBeenCalled();
    });
  });

  // ── Console debug ──────────────────────────────────────────────────

  describe('console debug', () => {
    it('logs when consoleDebug is enabled', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { consoleDebug: true }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(debugSpy).toHaveBeenCalled();
      expect(debugSpy.mock.calls[0][0]).toContain('TestPortal');
      debugSpy.mockRestore();
    });

    it('does not log when consoleDebug is disabled', async () => {
      const source$ = new Subject<ContextNavigationSourceEmission>();
      const nav = createMockNavigation('/apps/test-app', '');
      const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});
      const appContextProvider = createMockContextProvider({
        routingStrategy: 'query',
      });
      const appModules = createMockAppModules(appContextProvider);

      provider = new ContextNavigationProvider({
        app: { current$: EMPTY } as unknown as ContextNavigationProviderArgs['app'],
        navigation: nav as unknown as ContextNavigationProviderArgs['navigation'],
        context: createMockContextProvider(),
        config: createConfig(source$, { consoleDebug: false }),
      });

      source$.next({ appModules, appKey: 'test-app', context: CONTEXT_ITEM });
      await flush();

      expect(debugSpy).not.toHaveBeenCalled();
      debugSpy.mockRestore();
    });
  });
});
