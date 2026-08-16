import { describe, expect, it } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';

import { enableAppModule } from '../enable-app-module';
import type { AppModule } from '../module';

/**
 * Boots a full portal-shaped framework instance the same way `packages/dev-portal`'s
 * `configure.ts` does — `enableAppModule` registered directly on the portal's own
 * configurator, alongside its real `http`, `event`, `msal`, etc. — rather than a
 * standalone module graph assembled just for this test. Only the network call
 * itself is faked; the app module creates its client eagerly during its own
 * `requireInstance('http')` in the SAME configure→initialize pipeline, so this also
 * verifies middleware registered before `initialize()` reaches that client.
 */
const initializePortalWith = () =>
  mockFramework<[AppModule]>((configurator) => {
    configurator.http.configureClient('apps', { baseUri: 'https://apps.example.com' });
    configurator.http.addMiddleware(
      createRouterMiddleware('https://apps.example.com', (router) => {
        router.get('/persons/me/apps/:appKey', ({ params }) =>
          Response.json({
            appKey: params.appKey,
            displayName: 'Test App',
            description: 'A test application',
            type: 'standalone',
          }),
        );
      }),
    );
    enableAppModule(configurator);
  });

describe('AppModuleProvider', () => {
  it("fetches the manifest through the portal's own http client once a current app is set", async () => {
    const fusion = await initializePortalWith();

    fusion.modules.app.setCurrentApp('test-app');

    await expect(fusion.modules.app.current?.getManifestAsync()).resolves.toMatchObject({
      appKey: 'test-app',
      displayName: 'Test App',
    });
  });
});
