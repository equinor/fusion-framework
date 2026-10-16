import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  createHistory,
  NavigationInitiatorConflictError,
  type NavigationInitiator,
  type NavigationModule,
} from '@equinor/fusion-framework-module-navigation';

import { enableAppNavigation } from '../enable-app-navigation';
import type { AppEnv, AppModulesInstance } from '../types';
import { mockAppModules } from '../mock/mock-app-modules';

type Instance = AppModulesInstance<[NavigationModule]>;

const manifest = {
  appKey: 'test-app',
  displayName: 'Test App',
  description: 'A test application',
  type: 'standalone' as const,
  build: { version: '1.0.0', entryPoint: 'index.js' },
};

const instances: Instance[] = [];

/** Mirrors generated startup: one call, no `enableNavigation` or basename copying. */
const startModules = async (
  navigation: NavigationInitiator | undefined,
  configure?: Parameters<typeof enableAppNavigation>[2],
): Promise<Instance> => {
  const env: AppEnv = { manifest, navigation };
  const instance = await mockAppModules<[NavigationModule]>(
    (configurator) => enableAppNavigation(configurator, env, configure),
    env,
  );
  instances.push(instance);
  return instance;
};

const start = async (
  navigation: NavigationInitiator | undefined,
  configure?: Parameters<typeof enableAppNavigation>[2],
): Promise<Instance['navigation']> => (await startModules(navigation, configure)).navigation;

/** History state updates are applied asynchronously; wait for them to settle. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

afterEach(() => {
  for (const instance of instances.splice(0)) {
    instance.dispose();
  }
});

describe('enableAppNavigation', () => {
  it('adopts the host history and basename without app-owned navigation setup', async () => {
    const history = createHistory('memory');
    history.push('/apps/test-app/deep/link');
    await flush();

    const navigation = await start({ kind: 'host', history, basename: '/apps/test-app' });

    expect(navigation.basename).toBe('/apps/test-app');
    expect(navigation.path.pathname).toBe('/deep/link');

    history.go(-1);
    await flush();
    expect(navigation.path.pathname).toBe('/');
  });

  it('does not dispose the host history on dispose', async () => {
    const history = createHistory('memory');
    history.push('/apps/test-app');
    await flush();
    const disposeSpy = vi.spyOn(history, Symbol.dispose);

    const instance = await startModules({ kind: 'host', history, basename: '/apps/test-app' });
    instance.dispose();
    await flush();

    expect(disposeSpy).not.toHaveBeenCalled();
  });

  it('lets an existing explicit app adopt the initiator independently', async () => {
    const history = createHistory('memory');
    history.push('/apps/test-app/x');
    await flush();
    // compatible explicit basename is kept
    const navigation = await start(
      { kind: 'host', history, basename: '/apps/test-app' },
      (config) => config.setBasename('/apps/test-app'),
    );
    expect(navigation.path.pathname).toBe('/x');
  });

  it('fails startup when explicit settings conflict with the host', async () => {
    const history = createHistory('memory');
    await expect(
      start({ kind: 'host', history, basename: '/apps/test-app' }, (config) =>
        config.setBasename('/wrong'),
      ),
    ).rejects.toBeInstanceOf(NavigationInitiatorConflictError);
  });

  it('creates an isolated memory history for a memory initiator', async () => {
    const first = await start({ kind: 'memory', initialLocation: '/first', basename: '/w' });
    const second = await start({ kind: 'memory', basename: '/w' });
    expect(first.path.pathname).toBe('/first');
    expect(second.path.pathname).toBe('/');
  });

  it('falls back to standalone defaults without an initiator', async () => {
    const navigation = await start(undefined);
    expect(navigation.history).toBeDefined();
    expect(navigation.basename).toBe('');
  });
});
