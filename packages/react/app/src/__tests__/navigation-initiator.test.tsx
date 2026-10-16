import { useEffect, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { Fusion } from '@equinor/fusion-framework-react';
import type { AppEnv } from '@equinor/fusion-framework-app';
import {
  createHistory,
  type History,
  type NavigationInitiator,
} from '@equinor/fusion-framework-module-navigation';

import { enableAppNavigation } from '../navigation';
import { useNavigationModule } from '../navigation/useNavigationModule';
import { renderApp } from '../render-app';

const manifest: AppEnv['manifest'] = {
  appKey: 'test-app',
  displayName: 'Test App',
  description: 'A test application',
  type: 'standalone',
  build: { version: '1.0.0', entryPoint: 'index.js' },
};

/** History state updates are applied asynchronously; wait for them to settle. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

type Mounted = { el: HTMLElement; teardown: VoidFunction; history: () => History };

const mounted: Mounted[] = [];

/**
 * Mounts an app through the public `renderApp` path: startup only calls
 * `enableAppNavigation`, with no app-owned `enableNavigation` or basename copying.
 */
const mount = async (
  fusion: Fusion,
  navigation: NavigationInitiator | undefined,
  configure?: Parameters<typeof enableAppNavigation>[2],
  onError?: (error: unknown) => void,
): Promise<Mounted> => {
  let navigationHistory: History | undefined;

  const Location = () => {
    const provider = useNavigationModule();
    navigationHistory = provider.history;
    const [pathname, setPathname] = useState(provider.path.pathname);
    // The provider is not reactive on its own; follow its localized state stream.
    useEffect(() => {
      const subscription = provider.state$.subscribe(() => setPathname(provider.path.pathname));
      return () => subscription.unsubscribe();
    }, [provider]);
    return (
      <>
        <output data-testid="path">{pathname}</output>
        <button type="button" onClick={() => provider.push('/clicked')}>
          go
        </button>
      </>
    );
  };

  const env: AppEnv = { manifest, navigation };
  const el = document.createElement('div');
  document.body.append(el);
  const teardown = renderApp(Location, (configurator) =>
    enableAppNavigation(configurator, env, configure),
  )(el, { fusion, env, onError });

  const entry: Mounted = {
    el,
    teardown,
    history: () => {
      if (!navigationHistory) throw new Error('app has not rendered yet');
      return navigationHistory;
    },
  };
  mounted.push(entry);
  return entry;
};

const pathOf = (entry: Mounted): string | null | undefined =>
  entry.el.querySelector('[data-testid="path"]')?.textContent;

afterEach(() => {
  for (const entry of mounted.splice(0)) {
    entry.teardown();
    entry.el.remove();
  }
});

describe('initiator navigation through app initiation', () => {
  it('renders a host deep link and follows host back/forward', async () => {
    const fusion = await mockFramework();
    const host = createHistory('memory');
    host.push('/apps/test-app/deep/link');
    await flush();

    const app = await mount(fusion, { kind: 'host', history: host, basename: '/apps/test-app' });
    await vi.waitFor(() => expect(pathOf(app)).toBe('/deep/link'));

    app.el.querySelector('button')?.click();
    await vi.waitFor(() => expect(pathOf(app)).toBe('/clicked'));
    expect(host.location.pathname).toBe('/apps/test-app/clicked');

    host.go(-1);
    await vi.waitFor(() => expect(pathOf(app)).toBe('/deep/link'));
    host.go(1);
    await vi.waitFor(() => expect(pathOf(app)).toBe('/clicked'));
    host[Symbol.dispose]();
  });

  it('never disposes the host history on unmount', async () => {
    const fusion = await mockFramework();
    const host = createHistory('memory');
    host.push('/apps/test-app');
    await flush();
    const disposeSpy = vi.spyOn(host, Symbol.dispose);

    const app = await mount(fusion, { kind: 'host', history: host, basename: '/apps/test-app' });
    await vi.waitFor(() => expect(pathOf(app)).toBe('/'));
    app.teardown();
    await flush();

    expect(disposeSpy).not.toHaveBeenCalled();
    host.push('/apps/test-app/still-usable');
    await flush();
    expect(host.location.pathname).toBe('/apps/test-app/still-usable');
    host[Symbol.dispose]();
  });

  it('fails startup, reporting both settings, when explicit config conflicts with the host', async () => {
    const fusion = await mockFramework();
    const host = createHistory('memory');
    const onError = vi.fn();

    await mount(
      fusion,
      { kind: 'host', history: host, basename: '/apps/test-app' },
      (config) => config.setBasename('/other'),
      onError,
    );

    await vi.waitFor(() => expect(onError).toHaveBeenCalled());
    const error = onError.mock.calls[0]?.[0];
    expect(error).toBeInstanceOf(Error);
    expect((error as Error).message).toContain("basename: '/other'");
    expect((error as Error).message).toContain("basename: '/apps/test-app'");
    host[Symbol.dispose]();
  });

  it('isolates two simultaneous memory widgets and releases owned history on unmount', async () => {
    const fusion = await mockFramework();
    const first = await mount(fusion, { kind: 'memory', initialLocation: '/one' });
    const second = await mount(fusion, { kind: 'memory', initialLocation: '/two' });
    await vi.waitFor(() => expect(pathOf(first)).toBe('/one'));
    await vi.waitFor(() => expect(pathOf(second)).toBe('/two'));

    first.el.querySelector('button')?.click();
    await vi.waitFor(() => expect(pathOf(first)).toBe('/clicked'));
    expect(pathOf(second)).toBe('/two');

    const disposeSpy = vi.spyOn(first.history(), Symbol.dispose);
    first.teardown();
    await vi.waitFor(() => expect(disposeSpy).toHaveBeenCalled());
    // the other widget is unaffected
    expect(pathOf(second)).toBe('/two');
  });

  it('starts from a fresh memory history after remount without touching window.location', async () => {
    const fusion = await mockFramework();
    const before = window.location.href;

    const first = await mount(fusion, { kind: 'memory' });
    await vi.waitFor(() => expect(pathOf(first)).toBe('/'));
    first.el.querySelector('button')?.click();
    await vi.waitFor(() => expect(pathOf(first)).toBe('/clicked'));
    first.teardown();
    first.el.remove();

    const second = await mount(fusion, { kind: 'memory' });
    await vi.waitFor(() => expect(pathOf(second)).toBe('/'));
    expect(window.location.href).toBe(before);
  });

  it('releases modules when unmounted while initialization is still pending', async () => {
    const fusion = await mockFramework();
    const app = await mount(fusion, { kind: 'memory' });
    // unmount before the lazy component has resolved
    app.teardown();
    await flush();
    expect(pathOf(app)).toBeUndefined();
  });
});
