/**
 * Simulated portal for running the real context-navigation plugin against apps that
 * own their URL shape through custom context path hooks (App Admin, Help Admin, Meetings).
 *
 * Uses the real plugin, the real default adapter chain, and the URL guard enabled as in
 * the dev portal. Only the router, context service, and app module are replaced.
 */
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { vi } from 'vitest';

import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import type { ContextNavigationConfig, ReconcilerSourceEntry } from '../types';
import { createCustomAdapter } from '../adapters/custom-adapter/create-custom-adapter';
import { createPathAdapter } from '../adapters/create-path-adapter';
import { createQueryAdapter } from '../adapters/create-query-adapter';
import {
  createContextNavigationPlugin,
  type ContextNavigationPluginArgs,
} from '../create-context-navigation-plugin';

// ── App-key path hooks ──────────────────────────────────────────────────

const GUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Copy of `setContextPathExtractor` in fusion-core-apps `app-admin/src/config.ts` and
 * `fusion-help-admin/src/config.ts` (both apps use the same implementation).
 */
export const extractAppKeyFromPath = (path: string): string | undefined => {
  const urlParts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
  if (urlParts[0].match(GUIDPattern)) return urlParts[0];
  if (urlParts[0] === 'app') return urlParts[1];
  return undefined;
};

/** Copy of the matching `setContextPathGenerator` in both apps. */
export const generateAppKeyPath = (item: ContextItem, path: string): string => {
  const { appKey } = (item as ContextItem<{ appKey: string }>).value;
  const urlParts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
  if (urlParts[0] === 'app') {
    urlParts[1] = appKey;
    return urlParts.join('/');
  }
  return ['app', appKey].join('/');
};

// ── Contexts ────────────────────────────────────────────────────────────

/** An application context as the apps service returns it: GUID id, app key in value. */
const makeAppContext = (appKey: string, id: string): ContextItem =>
  ({ id, title: appKey, type: { id: 'App' }, value: { appKey } }) as unknown as ContextItem;

export const MY_APP = makeAppContext('my-app', '11111111-1111-4111-8111-111111111111');
export const OTHER_APP = makeAppContext('other-app', '22222222-2222-4222-8222-222222222222');

/** A project context: GUID id that is used directly in the URL. */
const makeProjectContext = (title: string, id: string): ContextItem =>
  ({ id, title, type: { id: 'ProjectMaster' }, value: {} }) as unknown as ContextItem;

export const PROJECT_A = makeProjectContext('project-a', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa');
export const PROJECT_B = makeProjectContext('project-b', 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb');

const CONTEXTS = [MY_APP, OTHER_APP, PROJECT_A, PROJECT_B];

// ── World ───────────────────────────────────────────────────────────────

export interface HistoryEntry {
  path: string;
  by: 'user' | 'plugin';
  replace?: boolean;
}

/** Let the plugin's async event dispatch + navigate settle. */
export const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

export interface CustomHookAppWorldOptions {
  appKey: string;
  /** App-relative start path, e.g. `/app/my-app/builds`. */
  startPath: string;
  context: ContextItem | null;
  replace: boolean;
  /** The app's context path hooks. Defaults to the App Admin / Help Admin hooks. */
  hooks?: {
    extract: (path: string) => string | undefined;
    generate: (item: ContextItem, path: string) => string | undefined;
  };
  /**
   * Hold URL guard lookups (`setCurrentContextById`) until `settleLookups()` is called,
   * to simulate a slow context service.
   */
  deferLookups?: boolean;
}

interface PendingLookup {
  id: string;
  canceled: boolean;
  settle: () => void;
}

export function createCustomHookAppWorld(opts: CustomHookAppWorldOptions) {
  const base = `/apps/${opts.appKey}`;
  const history: HistoryEntry[] = [{ path: `${base}${opts.startPath}`, by: 'user' }];
  const navigationState$ = new Subject<unknown>();
  const source$ = new Subject<ReconcilerSourceEntry>();

  // The app's context module — the object the custom adapter reads the hooks from.
  const appContext = {
    currentContext: opts.context as ContextItem | null,
    extractContextIdFromPath: opts.hooks?.extract ?? extractAppKeyFromPath,
    generatePathFromContext: opts.hooks?.generate ?? generateAppKeyPath,
    validateContext: () => true,
  };
  const appModules = { context: appContext } as unknown as AppModulesInstance<[ContextModule]>;

  const emitContext = () =>
    source$.next({ appKey: opts.appKey, appModules, contextState: appContext.currentContext });

  const navigation = {
    path: { pathname: `${base}${opts.startPath}`, search: '' },
    navigate: vi.fn((url: URL, navOpts?: { replace?: boolean }) => {
      navigation.path = { pathname: url.pathname, search: url.search };
      history.push({ path: url.pathname, by: 'plugin', replace: navOpts?.replace });
      navigationState$.next({});
    }),
    state$: navigationState$,
  };

  // Context service — resolves by GUID or by key (title), like the App/Help Admin clients.
  const resolveContext = (idOrKey: string): ContextItem => {
    const match = CONTEXTS.find((c) => c.id === idOrKey || c.title === idOrKey);
    if (!match) throw new Error(`unknown context ${idOrKey}`);
    appContext.currentContext = match;
    emitContext();
    return match;
  };

  const lookups: PendingLookup[] = [];

  const context = {
    // Used by the URL guard; unsubscribing cancels the lookup, as in the real provider.
    setCurrentContextById: vi.fn(
      (idOrKey: string) =>
        new Observable<ContextItem>((subscriber) => {
          const lookup: PendingLookup = {
            id: idOrKey,
            canceled: false,
            settle: () => {
              try {
                subscriber.next(resolveContext(idOrKey));
                subscriber.complete();
              } catch (err) {
                subscriber.error(err);
              }
            },
          };
          lookups.push(lookup);
          if (!opts.deferLookups) {
            Promise.resolve().then(() => !lookup.canceled && lookup.settle());
          }
          return () => {
            lookup.canceled = true;
          };
        }),
    ),
    // Used by the app itself (e.g. App Admin's AppProviderWrapper) and the context selector.
    setCurrentContextByIdAsync: vi.fn(async (idOrKey: string) => resolveContext(idOrKey)),
  };

  const event = { dispatchEvent: vi.fn(async () => ({ canceled: false })) };

  const app = {
    current$: new BehaviorSubject({
      appKey: opts.appKey,
      instance$: new BehaviorSubject(appModules),
      manifest$: new BehaviorSubject({ build: { options: {} } }),
    }),
  };

  // Dev-portal setup: URL guard on, default adapter chain.
  const config: ContextNavigationConfig = {
    portalName: 'dev-portal',
    origin: 'https://example.com',
    adapters: [createCustomAdapter(), createQueryAdapter(), createPathAdapter()],
    enableUrlGuard: true,
    debug: false,
    requireValidContext: false,
    sourceFactory: () => source$,
    navigationOptions: { replace: opts.replace },
  };

  const teardown = createContextNavigationPlugin({
    app: app as unknown as ContextNavigationPluginArgs['app'],
    navigation: navigation as unknown as ContextNavigationPluginArgs['navigation'],
    context: context as unknown as ContextNavigationPluginArgs['context'],
    event: event as unknown as ContextNavigationPluginArgs['event'],
    config,
  });

  // Prime the reconciler with the initial context (first emission is never an app switch).
  emitContext();

  return {
    base,
    history,
    context,
    teardown,
    get url() {
      return navigation.path.pathname;
    },
    get currentContext() {
      return appContext.currentContext;
    },
    /** URL guard lookups, including canceled ones. */
    lookups,
    /** Settle every held lookup that was not canceled (see `deferLookups`). */
    settleLookups() {
      for (const lookup of lookups.splice(0)) {
        if (!lookup.canceled) lookup.settle();
      }
    },
    get pluginNavigations() {
      return history.filter((h) => h.by === 'plugin');
    },
    /** The app's router changes location — not yet observed by the guard. */
    routerSetLocation(path: string) {
      navigation.path = { pathname: `${base}${path}`, search: '' };
      history.push({ path: `${base}${path}`, by: 'user' });
    },
    /** Portal navigation state$ emits — the URL guard runs. */
    emitNavigation() {
      navigationState$.next({});
    },
    /** User follows a link in the app (or uses browser Back): location change + guard runs. */
    userNavigate(path: string) {
      this.routerSetLocation(path);
      this.emitNavigation();
    },
    /** The app clears its context (e.g. App Admin's `ContextClearingWrapper`). */
    appClearsContext() {
      appContext.currentContext = null;
      emitContext();
    },
    /** User picks a context in the portal's context selector. */
    async userSelectsContext(item: ContextItem) {
      await context.setCurrentContextByIdAsync(item.id);
    },
  };
}

export type CustomHookAppWorld = ReturnType<typeof createCustomHookAppWorld>;
