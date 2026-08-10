import { describe, expect, it } from 'vitest';

import type { Fusion } from '@equinor/fusion-framework';
import { mockFramework } from '@equinor/fusion-framework/mock';
import { AppConfig, type AppModule } from '@equinor/fusion-framework-module-app';

import { AppMockConfigurator } from '../../mock/AppMockConfigurator.js';
import { mockAppModules } from '../../mock/mock-app-modules.js';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
    build: {
      version: '1.0.0',
      entryPoint: 'index.js',
    },
  },
  config: new AppConfig({ environment: { foo: 'bar' } }),
};

describe('mockApp', () => {
  it('initializes the app module pipeline with no configuration', async () => {
    const modules = await mockAppModules(undefined, env);

    expect(modules.event).toBeDefined();
    expect(modules.auth).toBeDefined();
    expect(modules.http).toBeDefined();
  });

  it('passes a real AppConfigurator to the callback', async () => {
    expect.assertions(1);

    await mockAppModules((configurator) => {
      expect(configurator).toBeInstanceOf(AppMockConfigurator);
    }, env);
  });

  it('answers a service-discovery-resolved client from the app’s own mocked http module', async () => {
    const modules = await mockAppModules((configurator) => {
      configurator.useFrameworkServiceClient('portal-api');
      // matches against the full resolved URL, so the host is part of the match to keep this
      // from also answering a different client's request
      configurator.http.addMiddleware(async (uri, init, next) =>
        uri === 'https://portal-api.fusion.test/items' ? Response.json([{ id: 1 }]) : next(uri, init),
      );
    }, env);

    await expect(modules.http.createClient('portal-api').json('/items')).resolves.toEqual([
      { id: 1 },
    ]);
  });

  it('reuses an already-mocked fusion instance instead of creating a new one', async () => {
    expect.assertions(1);

    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
    });

    await mockAppModules(
      (_configurator, { fusion: parent }) => {
        expect(parent.modules.auth.account?.name).toBe('Ada Lovelace');
      },
      env,
      fusion,
    );
  });

  it('awaits an async configure callback before initialize resolves', async () => {
    const modules = await mockAppModules(async (configurator) => {
      await Promise.resolve();
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
    }, env);

    expect(modules.auth.account?.name).toBe('Ada Lovelace');
  });

  it('serves this app’s own manifest and config through the default parent’s app module', async () => {
    expect.assertions(2);

    await mockAppModules(async (_configurator, { fusion }) => {
      // the default parent always has `app` enabled; typed as plain `Fusion` since callers
      // may pass in a parent without it, so the module set is narrowed just for this assertion
      const { app } = (fusion as Fusion<[AppModule]>).modules;
      app.setCurrentApp(env.manifest.appKey);

      await expect(app.current?.getManifestAsync()).resolves.toMatchObject({
        appKey: env.manifest.appKey,
        displayName: env.manifest.displayName,
      });
      await expect(app.current?.getConfigAsync()).resolves.toMatchObject({
        environment: env.config.environment,
      });
    }, env);
  });

  it('falls through to the real client for a manifest not matching this app’s own', async () => {
    expect.assertions(1);

    await mockAppModules(async (_configurator, { fusion }) => {
      const { app } = (fusion as Fusion<[AppModule]>).modules;
      app.setCurrentApp('some-other-app');

      await expect(app.current?.getManifestAsync()).rejects.toThrow();
    }, env);
  });
});
