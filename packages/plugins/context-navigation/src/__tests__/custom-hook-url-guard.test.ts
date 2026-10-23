/**
 * URL guard regressions for apps with custom path hooks (equinor/fusion-core-tasks#2521).
 *
 * - A generator that keeps the path unchanged must not make every URL look like the
 *   active context's URL.
 * - A URL-driven lookup that settles after the user navigated elsewhere must not change
 *   the context or redirect.
 */
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import type { ContextItem, ContextModule } from '@equinor/fusion-framework-module-context';
import { BehaviorSubject } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type CustomHookAppWorld,
  createCustomHookAppWorld,
  flush,
  MY_APP,
  PROJECT_A,
  PROJECT_B,
} from './custom-hook-app-world.js';

/** Project pages identified by slug (`/projects/project-a`); the generator never rewrites. */
const pathPreservingHooks = {
  extract: (path: string): string | undefined => path.match(/^\/projects\/([^/]+)/)?.[1],
  generate: (_item: ContextItem, path: string): string => path,
};

describe.each([
  { mode: 'push', replace: false },
  { mode: 'replace', replace: true },
])('URL guard with custom path hooks — $mode mode', ({ replace }) => {
  let world: CustomHookAppWorld;

  afterEach(() => world?.teardown());

  describe('path-preserving generator', () => {
    it.each(['/projects/project-b', '/projects/project-b/project-b'])(
      'moving to %s resolves that project',
      async (path) => {
        world = createCustomHookAppWorld({
          appKey: 'projects-app',
          startPath: '/projects/project-a',
          context: PROJECT_A,
          replace,
          hooks: pathPreservingHooks,
        });
        world.userNavigate(path);
        await flush();

        expect(world.context.setCurrentContextById).toHaveBeenCalledWith('project-b');
        expect(world.currentContext?.id).toBe(PROJECT_B.id);
        expect(world.url).toBe(`${world.base}${path}`);
      },
    );
  });

  it('does not re-resolve an app key repeated in a later route segment', async () => {
    world = createCustomHookAppWorld({
      appKey: 'app-admin',
      startPath: '/app/builds/overview',
      context: { ...MY_APP, value: { appKey: 'builds' } },
      replace,
    });
    world.userNavigate('/app/builds/builds');
    await flush();

    expect(world.context.setCurrentContextById).not.toHaveBeenCalled();
    expect(world.url).toBe(`${world.base}/app/builds/builds`);
    expect(world.pluginNavigations).toEqual([]);
  });

  describe('stale URL lookups (App Admin)', () => {
    const start = () =>
      createCustomHookAppWorld({
        appKey: 'app-admin',
        startPath: '/app/my-app/builds',
        context: MY_APP,
        replace,
        deferLookups: true,
      });

    const lifecycleDestinations = [
      { destination: 'dismissed', navigate: false },
      { destination: 'dismissed', navigate: true },
      { destination: 'loading', navigate: false },
      { destination: 'loading', navigate: true },
      { destination: 'contextless', navigate: false },
      { destination: 'contextless', navigate: true },
      { destination: 'unresolved-modules', navigate: false },
      { destination: 'unresolved-modules', navigate: true },
    ];
    // Exercise both successful and rejected service responses for every lifecycle transition.
    it.each(
      lifecycleDestinations.flatMap((entry) =>
        ['other-app', 'unknown-app'].map((id) => ({ ...entry, id })),
      ),
    )(
      'cancels $id lookup after $destination (navigation tick: $navigate)',
      async ({ destination, navigate, id }) => {
        world = start();
        // A known key would change context on success; an unknown key would redirect on failure.
        world.userNavigate(`/app/${id}/builds`);
        const [lookup] = world.lookups;

        if (destination === 'dismissed') {
          world.app.current$.next(undefined);
        } else if (destination === 'unresolved-modules') {
          world.activeApp.instance$.next(undefined);
        } else {
          // The runtime permits apps without context even though the guard's type assumes it.
          const modules = {} as AppModulesInstance<[ContextModule]>;
          world.app.current$.next({
            ...world.activeApp,
            appKey: 'destination',
            instance$: new BehaviorSubject<typeof modules | undefined>(
              destination === 'loading' ? undefined : modules,
            ),
          });
        }
        if (navigate) {
          world.navigation.path = { pathname: '/apps/destination', search: '' };
          world.emitNavigation();
        }
        expect(lookup.canceled).toBe(true);
        world.settleLookups();
        await flush();

        expect(world.currentContext?.id).toBe(MY_APP.id);
        expect(world.pluginNavigations).toEqual([]);
      },
    );

    it('a lookup that succeeds after the user left does not apply', async () => {
      world = start();
      world.userNavigate('/app/other-app/builds');
      const [lookup] = world.lookups;
      world.userNavigate('/categories');
      world.settleLookups();
      world.appClearsContext();
      await flush();

      expect(lookup.canceled).toBe(true);
      expect(world.currentContext).toBeNull();
      expect(world.url).toBe(`${world.base}/categories`);
      expect(world.pluginNavigations).toEqual([]);
    });

    it('a lookup that fails after the user left does not redirect back', async () => {
      world = start();
      world.userNavigate('/app/unknown-app/builds');
      const [lookup] = world.lookups;
      world.userNavigate('/categories');
      world.settleLookups();
      await flush();

      expect(lookup.canceled).toBe(true);
      expect(world.currentContext?.id).toBe(MY_APP.id);
      expect(world.url).toBe(`${world.base}/categories`);
      expect(world.pluginNavigations).toEqual([]);
    });

    it('a lookup for the current URL still applies', async () => {
      world = start();
      world.userNavigate('/app/other-app/builds');
      world.settleLookups();
      await flush();

      expect(world.context.setCurrentContextById).toHaveBeenCalledTimes(1);
      expect(world.currentContext?.title).toBe('other-app');
      expect(world.url).toBe(`${world.base}/app/other-app/builds`);
    });
  });
});
