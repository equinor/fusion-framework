/**
 * Help Admin simulation — equinor/fusion-core-tasks#2521
 *
 * Runs the real plugin against a replica of Help Admin's context path hooks
 * (fusion-core-apps/apps/fusion-help-admin/src/config.ts); see `custom-hook-app-world.ts`.
 *
 * Help Admin routes (fusion-help-admin/src/routes.tsx):
 * - `/` Home — no context; clears the active context while rendering.
 * - `/ai-logs` — global AI logs; no context, but does not clear it.
 * - `/app/:appKey/{overview,articles,faqs,release-notes,ai-logs}` — one application.
 *   The index route redirects to `./overview` (replace).
 *
 * Help Admin never sets the context from the URL itself: `AppWrapper` only reads it and
 * shows "Could not resolve app" when it is missing. The app search navigates to
 * `/app/<appKey>/` and relies on the platform to resolve the context.
 */
import { afterEach, describe, expect, it } from 'vitest';

import {
  type CustomHookAppWorld,
  createCustomHookAppWorld,
  flush,
  MY_APP,
  OTHER_APP,
} from './custom-hook-app-world';

const HELP_ADMIN = 'fusion-help-admin';
const BASE = `/apps/${HELP_ADMIN}`;

const createHelpAdminWorld = (opts: {
  startPath: string;
  context: typeof MY_APP | null;
  replace: boolean;
}) => createCustomHookAppWorld({ appKey: HELP_ADMIN, ...opts });

describe.each([
  { mode: 'push (dev portal)', replace: false },
  { mode: 'replace (default)', replace: true },
])('Help Admin context navigation — $mode mode (#2521)', ({ replace }) => {
  let world: CustomHookAppWorld;

  afterEach(() => world?.teardown());

  /** Opening `/app/<key>/` from the app search, followed by the index redirect. */
  const openAppFromSearch = async (appKey: string) => {
    world.userNavigate(`/app/${appKey}/`);
    await flush();
    world.userNavigate(`/app/${appKey}/overview`);
    await flush();
  };

  it('Overview → Home (guard first): stays on Home', async () => {
    world = createHelpAdminWorld({ startPath: '/app/my-app/overview', context: MY_APP, replace });
    world.userNavigate('/');
    await flush();
    world.appClearsContext();
    await flush();

    expect(world.url).toBe(`${BASE}/`);
    expect(world.currentContext).toBeNull();
    expect(world.pluginNavigations).toEqual([]);
  });

  it('Overview → Home (clear first): stays on Home', async () => {
    world = createHelpAdminWorld({ startPath: '/app/my-app/overview', context: MY_APP, replace });
    world.routerSetLocation('/');
    world.appClearsContext();
    world.emitNavigation();
    await flush();

    expect(world.url).toBe(`${BASE}/`);
    expect(world.currentContext).toBeNull();
    expect(world.pluginNavigations).toEqual([]);
  });

  it('Overview → global AI logs: stays on AI logs', async () => {
    world = createHelpAdminWorld({ startPath: '/app/my-app/overview', context: MY_APP, replace });
    world.userNavigate('/ai-logs');
    await flush();

    expect(world.url).toBe(`${BASE}/ai-logs`);
    expect(world.pluginNavigations).toEqual([]);
  });

  it('Home → app search: opens the app and resolves its context', async () => {
    world = createHelpAdminWorld({ startPath: '/', context: null, replace });
    await openAppFromSearch('other-app');

    expect(world.url).toBe(`${BASE}/app/other-app/overview`);
    expect(world.currentContext?.id).toBe(OTHER_APP.id);
  });

  it('global AI logs (previous app still active) → app search: opens the new app', async () => {
    world = createHelpAdminWorld({ startPath: '/ai-logs', context: MY_APP, replace });
    await openAppFromSearch('other-app');

    expect(world.url).toBe(`${BASE}/app/other-app/overview`);
    expect(world.currentContext?.id).toBe(OTHER_APP.id);
  });

  it('on Home, selecting an app in the context selector opens it', async () => {
    world = createHelpAdminWorld({ startPath: '/', context: null, replace });
    await world.userSelectsContext(OTHER_APP);
    await flush();
    // Help Admin's index route redirects to ./overview
    world.userNavigate('/app/other-app/overview');
    await flush();

    expect(world.url).toBe(`${BASE}/app/other-app/overview`);
    expect(world.currentContext?.id).toBe(OTHER_APP.id);
  });

  it('Overview → Articles in the same app does not re-resolve the context', async () => {
    world = createHelpAdminWorld({ startPath: '/app/my-app/overview', context: MY_APP, replace });
    world.userNavigate('/app/my-app/articles');
    await flush();

    expect(world.context.setCurrentContextByIdAsync).not.toHaveBeenCalled();
    expect(world.url).toBe(`${BASE}/app/my-app/articles`);
  });

  it('on an app page, clearing the context in the selector goes to Home', async () => {
    world = createHelpAdminWorld({ startPath: '/app/my-app/overview', context: MY_APP, replace });
    world.appClearsContext();
    await flush();

    expect(world.url).toBe(BASE);
  });
});
