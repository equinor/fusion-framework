import { describe, expect, it } from 'vitest';

import { AppConfig } from '@equinor/fusion-framework-module-app';
import { enableTelemetry } from '@equinor/fusion-framework-module-telemetry';

import { AppConfigurator } from '../../AppConfigurator.js';
import { AppMockConfigurator } from '../../mock/AppMockConfigurator.js';

const mockEnv = {
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
};

describe('AppMockConfigurator', () => {
  it('is a real AppConfigurator', () => {
    const configurator = new AppMockConfigurator(mockEnv);

    expect(configurator).toBeInstanceOf(AppMockConfigurator);
    expect(configurator).toBeInstanceOf(AppConfigurator);
  });

  it('constructs without throwing when env.config declares endpoints', async () => {
    // the base AppConfigurator constructor auto-registers these via addConfig,
    // before this class's own fields (#pinnedModules) are initialized
    const env = {
      ...mockEnv,
      config: new AppConfig({
        endpoints: { status: { url: 'https://status.example.com', scopes: [] } },
      }),
    };

    const configurator = new AppMockConfigurator(env);
    configurator.http.addMiddleware(async (uri, init, next) =>
      uri === 'https://status.example.com/health' ? Response.json({ ok: true }) : next(uri, init),
    );

    enableTelemetry(configurator);
    const modules = await configurator.initialize();

    await expect(modules.http.createClient('status').json('/health')).resolves.toEqual({
      ok: true,
    });
  });

  it('exposes the same http configurator the http module is built from', async () => {
    const configurator = new AppMockConfigurator(mockEnv);

    configurator.http.configureClient('catalog', { baseUri: 'https://api.example.com' });
    configurator.http.addMiddleware(async (uri, init, next) =>
      uri === 'https://api.example.com/items' ? Response.json([{ id: 1 }]) : next(uri, init),
    );

    // msal's config schema requires a telemetry module, normally wired by configureModules
    enableTelemetry(configurator);
    const modules = await configurator.initialize();

    await expect(modules.http.createClient('catalog').json('/items')).resolves.toEqual([{ id: 1 }]);
  });

  it('exposes the same msal configurator the auth module is built from', async () => {
    const configurator = new AppMockConfigurator(mockEnv);

    configurator.msal.setAccount({ name: 'Ada Lovelace' });

    // msal's config schema requires a telemetry module, normally wired by configureModules
    enableTelemetry(configurator);
    const modules = await configurator.initialize();

    expect(modules.auth.account?.name).toBe('Ada Lovelace');
  });

  it('answers a client registered through configureHttpClient via addMiddleware', async () => {
    const configurator = new AppMockConfigurator(mockEnv);

    configurator.configureHttpClient('status-api', { baseUri: 'https://status.example.com' });
    configurator.http.addMiddleware(async (uri, init, next) =>
      uri === 'https://status.example.com/status' ? Response.json({ ok: true }) : next(uri, init),
    );

    // msal's config schema requires a telemetry module, normally wired by configureModules
    enableTelemetry(configurator);
    const modules = await configurator.initialize();

    await expect(modules.http.createClient('status-api').json('/status')).resolves.toEqual({
      ok: true,
    });
  });
});
