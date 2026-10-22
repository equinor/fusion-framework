/**
 * URL guard regressions for apps with custom path hooks (equinor/fusion-core-tasks#2521).
 *
 * - A generator that keeps the path unchanged must not make every URL look like the
 *   active context's URL.
 * - A URL-driven lookup that settles after the user navigated elsewhere must not change
 *   the context or redirect.
 */
import type { ContextItem } from '@equinor/fusion-framework-module-context';
import { afterEach, describe, expect, it } from 'vitest';

import {
  type CustomHookAppWorld,
  createCustomHookAppWorld,
  flush,
  MY_APP,
  PROJECT_A,
  PROJECT_B,
} from './custom-hook-app-world';

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
    it('moving to another project resolves that project', async () => {
      world = createCustomHookAppWorld({
        appKey: 'projects-app',
        startPath: '/projects/project-a',
        context: PROJECT_A,
        replace,
        hooks: pathPreservingHooks,
      });
      world.userNavigate('/projects/project-b');
      await flush();

      expect(world.context.setCurrentContextById).toHaveBeenCalledWith('project-b');
      expect(world.currentContext?.id).toBe(PROJECT_B.id);
      expect(world.url).toBe(`${world.base}/projects/project-b`);
    });
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
