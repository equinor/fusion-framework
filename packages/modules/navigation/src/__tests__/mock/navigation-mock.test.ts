import { ModulesConfigurator } from '@equinor/fusion-framework-module';
import { firstValueFrom, take, toArray } from 'rxjs';
import { describe, expect, it } from 'vitest';

import { module as realModule } from '../../module';
import type { INavigationProvider } from '../../NavigationProvider.interface';
import { NavigationConfigurator } from '../../NavigationConfigurator';
import { NavigationProvider } from '../../NavigationProvider';

import { enableNavigationMock, NavigationMockConfigurator, navigationMockModule } from '../../mock';

/**
 * Initializes the mock module through the real module system.
 *
 * @remarks
 * Deliberately avoids hand-building initialization arguments — faking the
 * module system is the very cost this mock removes.
 *
 * @param configure - Optional callback to seed the initial location or configure the module further.
 * @returns The `INavigationProvider` the module produced.
 */
const initializeMockWith = async (
  configure?: (configurator: NavigationMockConfigurator) => void,
): Promise<INavigationProvider> => {
  const configurator = new ModulesConfigurator([]);
  enableNavigationMock(configurator, configure && { configure });
  const instances = await configurator.initialize();
  return getNavigation(instances);
};

/**
 * Reads the `navigation` provider off a resolved module instance map.
 *
 * @remarks
 * `ModulesConfigurator<[]>.initialize()` only knows about the modules in its
 * own generic — none here — so the `navigation` key added by
 * `enableNavigationMock` is invisible to its return type. The cast is safe:
 * `enableNavigationMock` always registers the navigation module.
 * @param instances - The resolved instance map returned by `configurator.initialize()`.
 * @returns The `INavigationProvider` instance.
 */
const getNavigation = (instances: unknown): INavigationProvider =>
  (instances as { navigation: INavigationProvider }).navigation;

describe('navigationMockModule', () => {
  it('changes nothing but the configurator', () => {
    expect(navigationMockModule.name).toBe(realModule.name);
    expect(navigationMockModule.version).toBe(realModule.version);
    // The production initializer, untouched — the mock has no lifecycle of its own
    expect(navigationMockModule.initialize).toBe(realModule.initialize);
  });

  it('builds a real NavigationConfigurator, so the whole builder stays available', () => {
    const configurator = navigationMockModule.configure?.();

    expect(configurator).toBeInstanceOf(NavigationConfigurator);
    expect(configurator).toBeInstanceOf(NavigationMockConfigurator);
  });
});

describe('enableNavigationMock', () => {
  it('produces the real NavigationProvider, not a stand-in', async () => {
    const provider = await initializeMockWith();

    expect(provider).toBeInstanceOf(NavigationProvider);
  });

  it('uses memory history even though `window` is defined in this test environment', async () => {
    // A test environment (jsdom/happy-dom) always defines `window`, which is exactly
    // what makes NavigationConfigurator's default fall back to real browser history.
    expect(typeof window).not.toBe('undefined');

    const originalUrl = window.location.href;
    // replaceState avoids adding a stack entry; restored in `finally` so this
    // test doesn't leak document-location state into tests that run after it.
    window.history.replaceState({}, '', '/somewhere-else');
    try {
      const provider = await initializeMockWith();

      // Unaffected by the real document location - proof the history is in-memory.
      // (NavigationProvider normalizes the root path to '', not '/'.)
      expect(provider.path.pathname).toBe('');
    } finally {
      window.history.replaceState({}, '', originalUrl);
    }
  });

  it('replaces a navigation module that is already registered', async () => {
    // A FrameworkConfigurator pre-registers the real navigation module, so the
    // mock is only useful if registering it afterwards wins
    const configurator = new ModulesConfigurator([realModule]);
    enableNavigationMock(configurator);

    const instances = await configurator.initialize();
    const provider = getNavigation(instances);

    expect(provider.path.pathname).toBe('');
  });

  it('sets the basename from the string shortcut', async () => {
    const provider = await initializeMockWith();
    expect(provider.basename).toBe('');

    const configurator = new ModulesConfigurator([]);
    enableNavigationMock(configurator, '/apps/my-app');
    const instances = await configurator.initialize();
    const withBasename = getNavigation(instances);

    expect(withBasename.basename).toBe('/apps/my-app');
  });

  it('seeds the initial location through setInitialLocation()', async () => {
    const provider = await initializeMockWith((configurator) => {
      configurator.setInitialLocation('/users/42?tab=info');
    });

    expect(provider.path.pathname).toBe('/users/42');
    expect(provider.path.search).toBe('?tab=info');
  });

  it('scopes setInitialLocation() under a basename set beforehand, like navigate()/push()/replace()', async () => {
    const provider = await initializeMockWith((configurator) => {
      configurator.setBasename('/apps/my-app');
      configurator.setInitialLocation('/users/42');
    });

    expect(provider.basename).toBe('/apps/my-app');
    // localized path stays basename-relative ...
    expect(provider.path.pathname).toBe('/users/42');
    // ... while the seeded route is actually within the basename's scope on state$.
    const [update] = await firstValueFrom(provider.state$.pipe(take(1), toArray()));
    expect(update.location.pathname).toBe('/apps/my-app/users/42');
  });
});
