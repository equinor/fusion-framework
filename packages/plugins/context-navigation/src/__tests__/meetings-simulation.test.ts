/**
 * Meetings simulation — equinor/fusion-core-tasks#2521
 *
 * Runs the real plugin against a replica of the Meetings app's context path hooks
 * (equinor/fusion-app-meetings `src/config.ts`); see `custom-hook-app-world.ts`.
 *
 * Every Meetings route lives under an optional project prefix (`/:projectId?/...`), so
 * each page exists with a project (`/<guid>/meeting/123`) and without one
 * (`/landingpage/allmeetings`). The app never sets or clears the context itself — the
 * portal context selector and the URL drive it. Its generator sends any context change
 * to `<id>/landingpage/mymeetings`.
 */
import { afterEach, describe, expect, it } from 'vitest';

import type { ContextItem } from '@equinor/fusion-framework-module-context';
import {
  type CustomHookAppWorld,
  createCustomHookAppWorld,
  flush,
  PROJECT_A,
  PROJECT_B,
} from './custom-hook-app-world';

const MEETINGS = 'meetings';
const BASE = `/apps/${MEETINGS}`;
const A = PROJECT_A.id;
const B = PROJECT_B.id;

// ── Meetings hooks (copied from equinor/fusion-app-meetings src/config.ts) ──

const GUIDPattern =
  /^(?:(?:[0-9a-fA-F]){8}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){4}-(?:[0-9a-fA-F]){12})$/;

enum RoutesDashboards {
  LandingPageMyMeetings = 'landingpage/mymeetings',
}

const extract = (path: string) => {
  const urlParts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');
  const contextId = new RegExp(GUIDPattern).exec(urlParts[0]) ? urlParts[0] : undefined;
  return contextId;
};

const generate = (item: ContextItem, path: string) => {
  const contextItem = item as ContextItem<Record<string, unknown>>;
  const urlParts = path.startsWith('/') ? path.slice(1).split('/') : path.split('/');

  const hasChangeTheContext = contextItem.id !== urlParts[0];
  const hasExitContext = !contextItem.id && new RegExp(GUIDPattern).exec(urlParts[0]);

  if (hasChangeTheContext) return `${contextItem.id}/${RoutesDashboards.LandingPageMyMeetings}`;
  else if (hasExitContext) return RoutesDashboards.LandingPageMyMeetings;
  return [contextItem.id, ...urlParts.slice(1)].join('/');
};

const createMeetingsWorld = (opts: {
  startPath: string;
  context: ContextItem | null;
  replace: boolean;
}) => createCustomHookAppWorld({ appKey: MEETINGS, hooks: { extract, generate }, ...opts });

describe.each([
  { mode: 'push (dev portal)', replace: false },
  { mode: 'replace (default)', replace: true },
])('Meetings context navigation — $mode mode (#2521)', ({ replace }) => {
  let world: CustomHookAppWorld;

  afterEach(() => world?.teardown());

  it('selecting a project on a page without project opens its landing page', async () => {
    world = createMeetingsWorld({ startPath: '/landingpage/mymeetings', context: null, replace });
    await world.userSelectsContext(PROJECT_A);
    await flush();

    expect(world.url).toBe(`${BASE}/${A}/landingpage/mymeetings`);
  });

  it('switching project opens the new project landing page', async () => {
    world = createMeetingsWorld({ startPath: `/${A}/meeting/123`, context: PROJECT_A, replace });
    await world.userSelectsContext(PROJECT_B);
    await flush();

    expect(world.url).toBe(`${BASE}/${B}/landingpage/mymeetings`);
  });

  it('clearing the project goes to the app root', async () => {
    world = createMeetingsWorld({ startPath: `/${A}/meeting/123`, context: PROJECT_A, replace });
    world.appClearsContext();
    await flush();

    expect(world.url).toBe(BASE);
  });

  it('navigating within the project does not re-resolve or redirect', async () => {
    world = createMeetingsWorld({ startPath: `/${A}/meeting/123`, context: PROJECT_A, replace });
    world.userNavigate(`/${A}/series/456/agenda`);
    await flush();

    expect(world.context.setCurrentContextByIdAsync).not.toHaveBeenCalled();
    expect(world.pluginNavigations).toEqual([]);
    expect(world.url).toBe(`${BASE}/${A}/series/456/agenda`);
  });

  it('browser Back to the previous project page restores that project', async () => {
    world = createMeetingsWorld({
      startPath: `/${B}/landingpage/mymeetings`,
      context: PROJECT_B,
      replace,
    });
    world.userNavigate(`/${A}/meeting/123`);
    await flush();

    expect(world.currentContext?.id).toBe(A);
    expect(world.url).toBe(`${BASE}/${A}/meeting/123`);
  });

  it('opening a project link with no project selected resolves that project', async () => {
    world = createMeetingsWorld({ startPath: '/landingpage/mymeetings', context: null, replace });
    world.userNavigate(`/${A}/meeting/123`);
    await flush();

    expect(world.currentContext?.id).toBe(A);
    expect(world.url).toBe(`${BASE}/${A}/meeting/123`);
  });

  it('opening a page without project keeps the page (project stays selected)', async () => {
    world = createMeetingsWorld({
      startPath: `/${A}/landingpage/mymeetings`,
      context: PROJECT_A,
      replace,
    });
    world.userNavigate('/landingpage/allmeetings');
    await flush();

    expect(world.url).toBe(`${BASE}/landingpage/allmeetings`);
    expect(world.pluginNavigations).toEqual([]);
    expect(world.currentContext?.id).toBe(A);
  });

  it('selecting a project on a page without project, while another is selected, opens it', async () => {
    world = createMeetingsWorld({
      startPath: '/landingpage/allmeetings',
      context: PROJECT_A,
      replace,
    });
    await world.userSelectsContext(PROJECT_B);
    await flush();

    expect(world.url).toBe(`${BASE}/${B}/landingpage/mymeetings`);
  });
});
