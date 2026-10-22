/**
 * App Admin simulation — equinor/fusion-core-tasks#2521
 *
 * Runs the real plugin against a replica of App Admin's context path hooks
 * (fusion-core-apps/apps/app-admin/src/config.ts); see `custom-hook-app-world.ts`.
 *
 * Scenarios mirror real App Admin flows between pages with an application context
 * (`/app/:appKey/...`) and pages without one (`/categories`, `/apps`, ...).
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  type CustomHookAppWorld,
  createCustomHookAppWorld,
  flush,
  MY_APP,
  OTHER_APP,
} from './custom-hook-app-world';

const APP_ADMIN = 'app-admin';
const BASE = `/apps/${APP_ADMIN}`;

const createAppAdminWorld = (opts: {
  startPath: string;
  context: typeof MY_APP | null;
  replace: boolean;
}) => createCustomHookAppWorld({ appKey: APP_ADMIN, ...opts });

// ── Scenarios ───────────────────────────────────────────────────────────

describe.each([
  { mode: 'push (dev portal)', replace: false },
  { mode: 'replace (default)', replace: true },
])('App Admin context navigation — $mode mode (#2521)', ({ replace }) => {
  let world: CustomHookAppWorld;

  afterEach(() => world?.teardown());

  /** Builds → Categories where the URL guard sees the URL before App Admin clears the context. */
  it('Builds → Categories (guard first): stays on Categories', async () => {
    world = createAppAdminWorld({ startPath: '/app/my-app/builds', context: MY_APP, replace });
    world.userNavigate('/categories');
    await flush();
    world.appClearsContext();
    await flush();

    expect(world.url).toBe(`${BASE}/categories`);
    expect(world.currentContext).toBeNull();
    expect(world.history.filter((h) => h.by === 'plugin')).toEqual([]);
  });

  /** Builds → Categories where App Admin clears the context before the guard runs. */
  it('Builds → Categories (clear first): stays on Categories', async () => {
    world = createAppAdminWorld({ startPath: '/app/my-app/builds', context: MY_APP, replace });
    world.routerSetLocation('/categories');
    world.appClearsContext();
    world.emitNavigation();
    await flush();

    expect(world.url).toBe(`${BASE}/categories`);
    expect(world.currentContext).toBeNull();
    expect(world.history.filter((h) => h.by === 'plugin')).toEqual([]);
  });

  it('on Categories, selecting an app in the context selector opens it', async () => {
    world = createAppAdminWorld({ startPath: '/categories', context: null, replace });
    await world.userSelectsContext(OTHER_APP);
    await flush();

    expect(world.url).toBe(`${BASE}/app/other-app`);
    expect(world.currentContext?.id).toBe(OTHER_APP.id);
  });

  it('on Categories, opening an app link keeps the link target', async () => {
    world = createAppAdminWorld({ startPath: '/categories', context: null, replace });
    world.userNavigate('/app/other-app/builds');
    // App Admin's AppProviderWrapper resolves the context by app key
    await world.context.setCurrentContextByIdAsync('other-app');
    await flush();

    expect(world.url).toBe(`${BASE}/app/other-app/builds`);
    expect(world.currentContext?.id).toBe(OTHER_APP.id);
  });

  it('on an app page, clearing the context in the selector goes to the start page', async () => {
    world = createAppAdminWorld({ startPath: '/app/my-app/builds', context: MY_APP, replace });
    world.appClearsContext();
    await flush();

    expect(world.url).toBe(BASE);
  });

  /** The URL holds the app key while the context id is a GUID. */
  it('Builds → Settings in the same app does not re-resolve the context', async () => {
    world = createAppAdminWorld({ startPath: '/app/my-app/builds', context: MY_APP, replace });
    world.userNavigate('/app/my-app/settings');
    await flush();

    expect(world.context.setCurrentContextByIdAsync).not.toHaveBeenCalled();
    expect(world.url).toBe(`${BASE}/app/my-app/settings`);
  });

  if (!replace) {
    it('browser Back to another app page sets the context from the URL', async () => {
      world = createAppAdminWorld({ startPath: '/app/my-app/builds', context: MY_APP, replace });
      world.userNavigate('/app/other-app/builds');
      await flush();

      expect(world.context.setCurrentContextByIdAsync).toHaveBeenCalledWith('other-app');
      expect(world.currentContext?.id).toBe(OTHER_APP.id);
      expect(world.url).toBe(`${BASE}/app/other-app/builds`);
    });
  }
});
