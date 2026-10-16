import { afterEach, describe, expect, it, vi } from 'vitest';
import { ModulesConfigurator, type ModulesInstance } from '@equinor/fusion-framework-module';
import {
  createHistory,
  enableNavigation,
  NavigationInitiatorConflictError,
  type NavigationInitiator,
  type NavigationModule,
} from '../index';

type Instance = ModulesInstance<[NavigationModule]>;

const instances: Instance[] = [];

/** History state updates are applied asynchronously; wait for them to settle. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

/** Initializes a navigation module the way an app/widget configurator would. */
const start = async (
  options: Parameters<typeof enableNavigation>[1],
): Promise<Instance['navigation']> => {
  const configurator = new ModulesConfigurator<[NavigationModule]>([]);
  enableNavigation(configurator, options);
  const instance = (await configurator.initialize()) as Instance;
  instances.push(instance);
  return instance.navigation;
};

afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.dispose();
  }
});

describe('navigation initiator: host', () => {
  it('uses the host history and basename, composing deep links with the basename', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app/users/42?tab=1');
    await flush();

    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
    });

    expect(navigation.basename).toBe('/apps/my-app');
    expect(navigation.path.pathname).toBe('/users/42');
    expect(navigation.path.search).toBe('?tab=1');
  });

  it('composes the app basename with a context prefix in the host path', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app/ctx-1/details');
    await flush();
    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
    });
    expect(navigation.path.pathname).toBe('/ctx-1/details');
  });

  it('navigates and supports back/forward through the host history', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app');
    await flush();
    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
    });

    navigation.push('/a');

    await flush();
    navigation.push('/b');
    await flush();
    expect(history.location.pathname).toBe('/apps/my-app/b');

    history.go(-1);
    await flush();
    expect(navigation.path.pathname).toBe('/a');
    history.go(1);
    await flush();
    expect(navigation.path.pathname).toBe('/b');
  });

  it('feeds the router from the navigation module history', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app/users/7');
    await flush();
    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
    });

    const router = navigation.createRouter([{ path: '/users/:id', element: null }]);
    router.initialize();
    expect(router.state.location.pathname).toBe('/apps/my-app/users/7');
    expect(router.state.matches.map((match) => match.params.id)).toEqual(['7']);
    router.dispose();
  });

  it('never disposes the host-owned history', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app');
    await flush();
    const disposeSpy = vi.spyOn(history, Symbol.dispose);

    const configurator = new ModulesConfigurator<[NavigationModule]>([]);
    enableNavigation(configurator, {
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
    });
    const instance = (await configurator.initialize()) as Instance;
    instance.dispose();
    await Promise.resolve();

    expect(disposeSpy).not.toHaveBeenCalled();
    // host history keeps working after the app is gone
    history.push('/apps/my-app/after');
    await flush();
    expect(history.location.pathname).toBe('/apps/my-app/after');
  });

  it('never disposes the host history when it is set explicitly with proxy: false', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app');
    await flush();
    const disposeSpy = vi.spyOn(history, Symbol.dispose);

    const configurator = new ModulesConfigurator<[NavigationModule]>([]);
    enableNavigation(configurator, {
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
      configure: (config) => config.setHistory(history, { proxy: false }),
    });
    const instance = (await configurator.initialize()) as Instance;
    instance.dispose();
    await Promise.resolve();

    expect(disposeSpy).not.toHaveBeenCalled();
  });

  it('rejects a different unproxied history under a host initiator and leaves the host history alone', async () => {
    const host = createHistory('memory');
    const other = createHistory('memory');
    const hostDispose = vi.spyOn(host, Symbol.dispose);
    const configurator = new ModulesConfigurator<[NavigationModule]>([]);
    enableNavigation(configurator, {
      initiator: { kind: 'host', history: host, basename: '/apps/my-app' },
      configure: (config) => config.setHistory(other, { proxy: false }),
    });
    await expect(configurator.initialize()).rejects.toThrow(NavigationInitiatorConflictError);
    expect(hostDispose).not.toHaveBeenCalled();
    other[Symbol.dispose]();
  });

  it('keeps compatible explicit settings (normalized basename, same history)', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app');
    await flush();
    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
      configure: (config) => {
        config.setBasename('/apps/my-app/');
        config.setHistory(history);
      },
    });
    expect(navigation.basename).toBe('/apps/my-app');
  });

  it('fails startup when an explicit basename conflicts, identifying both settings', async () => {
    const history = createHistory('memory');
    const promise = start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
      configure: (config) => config.setBasename('/other'),
    });
    await expect(promise).rejects.toBeInstanceOf(NavigationInitiatorConflictError);
    await expect(promise).rejects.toThrow(/explicit app setting \(basename: '\/other'\)/);
    await expect(promise).rejects.toThrow(/required host setting \(basename: '\/apps\/my-app'\)/);
  });

  it('fails startup when an explicit history differs from the host history', async () => {
    const history = createHistory('memory');
    const other = createHistory('memory');
    const promise = start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
      configure: (config) => config.setHistory(other),
    });
    await expect(promise).rejects.toMatchObject({
      name: 'NavigationInitiatorConflictError',
      setting: 'history',
    });
    other[Symbol.dispose]();
  });

  it('keeps an explicit undefined basename from dropping the host basename', async () => {
    const history = createHistory('memory');
    history.push('/apps/my-app');
    await flush();
    const navigation = await start({
      initiator: { kind: 'host', history, basename: '/apps/my-app' },
      configure: (config) => config.setBasename(undefined),
    });
    expect(navigation.basename).toBe('/apps/my-app');
  });

  it.each([
    [{ kind: 'host', basename: '/a' }],
    [{ kind: 'host', history: createHistory('memory') }],
    [{ kind: 'unknown' }],
    [null],
  ])('rejects invalid initiator %#', async (initiator) => {
    // @ts-expect-error intentionally invalid input
    await expect(start({ initiator })).rejects.toThrow(/Invalid navigation initiator/);
  });
});

describe('navigation initiator: memory', () => {
  const memory = (initiator: Omit<Extract<NavigationInitiator, { kind: 'memory' }>, 'kind'> = {}) =>
    start({ initiator: { kind: 'memory', ...initiator } });

  it('creates isolated per-instance histories', async () => {
    const first = await memory();
    const second = await memory();

    first.push('/only-first');
    await flush();
    expect(first.path.pathname).toBe('/only-first');
    expect(second.path.pathname).toBe('/');
    expect(first.history).not.toBe(second.history);
  });

  it('does not read or modify window.location', async () => {
    const before = window.location.href;
    const entries = window.history.length;
    const locationSpy = vi.spyOn(window, 'location', 'get');

    const navigation = await memory({ initialLocation: '/start', basename: '/widget' });
    navigation.push('/next');
    await flush();
    navigation.replace('/replaced');
    await flush();
    navigation.history.go(-1);
    await flush();

    expect(locationSpy).not.toHaveBeenCalled();
    locationSpy.mockRestore();
    expect(window.location.href).toBe(before);
    expect(window.history.length).toBe(entries);
  });

  it('applies initial location and basename', async () => {
    const navigation = await memory({ initialLocation: '/start?x=1', basename: '/widget/' });
    expect(navigation.basename).toBe('/widget');
    expect(navigation.history.location.pathname).toBe('/widget/start');
    expect(navigation.path.pathname).toBe('/start');
    expect(navigation.path.search).toBe('?x=1');
  });

  it('uses an initial location already inside the basename as given', async () => {
    const navigation = await memory({ initialLocation: '/widget/start', basename: '/widget' });
    expect(navigation.path.pathname).toBe('/start');
  });

  it('starts at the app root without options', async () => {
    const navigation = await memory({ basename: '/widget' });
    expect(navigation.history.location.pathname).toBe('/widget');
    expect(navigation.path.pathname).toBe('/');
  });

  it('supports back/forward within the instance', async () => {
    const navigation = await memory({ basename: '/widget' });
    navigation.push('/a');
    await flush();
    navigation.push('/b');
    await flush();
    navigation.history.go(-1);
    await flush();
    expect(navigation.path.pathname).toBe('/a');
    navigation.history.go(1);
    await flush();
    expect(navigation.path.pathname).toBe('/b');
  });

  it('disposes the owned memory history and starts fresh on remount', async () => {
    const configurator = new ModulesConfigurator<[NavigationModule]>([]);
    enableNavigation(configurator, { initiator: { kind: 'memory' } });
    const instance = (await configurator.initialize()) as Instance;
    const history = instance.navigation.history;
    const disposeSpy = vi.spyOn(history, Symbol.dispose);
    instance.navigation.push('/dirty');
    instance.dispose();
    await Promise.resolve();
    expect(disposeSpy).toHaveBeenCalled();

    const remounted = await memory();
    expect(remounted.path.pathname).toBe('/');
    expect(remounted.history).not.toBe(history);
  });

  it('lets explicit configuration win over the memory strategy', async () => {
    const history = createHistory('memory');
    history.push('/explicit');
    await flush();
    const navigation = await start({
      initiator: { kind: 'memory', initialLocation: '/ignored' },
      configure: (config) => config.setHistory(history),
    });
    expect(navigation.path.pathname).toBe('/explicit');
    history[Symbol.dispose]();
  });
});

describe('standalone defaults', () => {
  it('uses browser history without an initiator', async () => {
    window.history.pushState({}, '', '/standalone');
    const navigation = await start(undefined);
    expect(navigation.path.pathname).toBe('/standalone');
    navigation.push('/moved');
    await flush();
    expect(window.location.pathname).toBe('/moved');
  });
});
