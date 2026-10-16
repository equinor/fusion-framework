import { afterEach, describe, expect, it, vi } from 'vitest';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppManifest, AppModule } from '@equinor/fusion-framework-module-app';
import {
  createHistory,
  enableNavigation,
  type History,
  type NavigationModule,
} from '@equinor/fusion-framework-module-navigation';
import { renderAppComponent } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { Apploader } from '../apploader/Apploader';

// resolved from this test file rather than hardcoded, so it survives a package move
const fixturesUri = new URL('./fixtures', import.meta.url).pathname;

/** History state updates are applied asynchronously; wait for them to settle. */
const flush = (): Promise<void> => new Promise((resolve) => setTimeout(resolve, 0));

const hosts: History[] = [];

/**
 * Mounts a child app through the real `Apploader` initiation. The parent framework owns the
 * URL (`host`), and the child is a real app rendering `Router` from its entry point.
 */
const load = async (entryPoint: string, initialUrl: string) => {
  const manifest: AppManifest = {
    appKey: 'child-app',
    displayName: 'Child App',
    description: 'A child application',
    type: 'standalone',
    build: { version: '1.0.0', entryPoint, assetPath: '' },
  };
  const host = createHistory('memory');
  hosts.push(host);
  host.push(initialUrl);
  await flush();

  const fusion = await mockFramework<[AppModule, NavigationModule]>((configurator) => {
    enableAppManifestMock(configurator, { manifest }, fixturesUri);
    // the parent navigation module owns (and exposes) the host history
    enableNavigation(configurator, {
      configure: (config) => config.setHistory(host, { proxy: false }),
    });
  });
  fusion.modules.app.setCurrentApp('child-app');

  const view = await renderAppComponent(<Apploader appKey="child-app" />, { fusion });
  const path = (): string | null | undefined =>
    view.container.querySelector('[data-testid="path"]')?.textContent;
  return { host, view, path };
};

afterEach(() => {
  for (const host of hosts.splice(0)) {
    host[Symbol.dispose]();
  }
});

describe.each([
  ['enableAppNavigation (host initiator)', 'apploader-initiator-child-script.tsx'],
  ['legacy explicit env.basename', 'apploader-legacy-child-script.tsx'],
])('apploader initiation: %s', (_name, entryPoint) => {
  it('renders the deep link under the app basename and follows push and back/forward', async () => {
    const { host, view, path } = await load(entryPoint, '/apps/child-app/deep/link');
    await vi.waitFor(() => expect(path()).toBe('/deep/link'));

    view.container.querySelector('button')?.click();
    await vi.waitFor(() => expect(path()).toBe('/clicked'));
    expect(host.location.pathname).toBe('/apps/child-app/clicked');

    host.go(-1);
    await vi.waitFor(() => expect(path()).toBe('/deep/link'));
    host.go(1);
    await vi.waitFor(() => expect(path()).toBe('/clicked'));
  });

  it('keeps the host history usable and undisposed after unmount', async () => {
    const { host, view, path } = await load(entryPoint, '/apps/child-app');
    await vi.waitFor(() => expect(path()).toBe('/'));
    const disposeSpy = vi.spyOn(host, Symbol.dispose);

    view.unmount();
    await flush();

    expect(disposeSpy).not.toHaveBeenCalled();
    host.push('/apps/child-app/after-unmount');
    await flush();
    expect(host.location.pathname).toBe('/apps/child-app/after-unmount');
  });
});
