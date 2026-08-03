import { afterEach, describe, expect, it, vi } from 'vitest';

import { init } from '../../init.js';
import { createMockService, FrameworkMockConfigurator, mockFramework } from '../../mock/index.js';

/**
 * Pins the snippets in `docs/testing.md` and the package README to real
 * behaviour, so documentation cannot drift away from the API it describes.
 */
describe('documented usage', () => {
  afterEach(() => vi.restoreAllMocks());

  it('composes the service registry on the builder', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.serviceDiscovery.setBaseUri('http://localhost:6669');
      configurator.serviceDiscovery.addService({ key: 'my-api' });
      configurator.serviceDiscovery.removeService('bookmarks');
    });

    await expect(fusion.modules.serviceDiscovery.resolveService('my-api')).resolves.toMatchObject({
      key: 'my-api',
    });
  });

  it('replaces the baseline registry with setServices', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.serviceDiscovery.setServices([{ key: 'apps', uri: 'http://localhost:3000' }]);
    });

    await expect(fusion.modules.serviceDiscovery.resolveService('apps')).resolves.toMatchObject({
      uri: 'http://localhost:3000',
    });
  });

  it('keeps startup working when the registry is replaced, because unknown services synthesise', async () => {
    // The context module resolves `context` while initializing, so a replaced
    // registry that omits it would break start-up if synthesis were disabled.
    const fusion = await mockFramework((configurator) => {
      configurator.serviceDiscovery.setServices([{ key: 'apps', uri: 'http://localhost:3000' }]);
    });

    await expect(fusion.modules.serviceDiscovery.resolveService('people')).resolves.toBeDefined();
  });

  it('lets the test runner spy on the discovery client', async () => {
    const fusion = await mockFramework();

    vi.spyOn(fusion.modules.serviceDiscovery.client, 'resolveService').mockResolvedValue(
      createMockService({ key: 'apps', uri: 'http://spied' }),
    );

    await expect(fusion.modules.serviceDiscovery.resolveService('apps')).resolves.toMatchObject({
      uri: 'http://spied',
    });
  });

  it('lets the test runner spy on the auth client', async () => {
    const fusion = await mockFramework();

    const spy = vi.spyOn(fusion.modules.auth.client, 'acquireToken');

    await fusion.modules.auth.acquireAccessToken({ request: { scopes: ['Files.Read'] } });

    expect(spy).toHaveBeenCalled();
  });

  it('resolves the real scope through the real provider, not the test double', async () => {
    const fusion = await mockFramework((configurator) => {
      // The client is configured with what it talks to, exactly as in production
      configurator.msal.setClientConfig({ auth: { clientId: 'my-app', tenantId: 'my-tenant' } });
    });

    const token = await fusion.modules.auth.acquireAccessToken();
    const claims = JSON.parse(atob(token?.split('.')[1] ?? ''));

    // MsalProvider — not the mock — turns "no scopes requested" into `${clientId}/.default`
    expect(claims.scp).toBe('my-app/.default');
  });

  it('signs nobody in when the account is signed out', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount({ signedOut: true });
    });

    expect(fusion.modules.auth.account).toBeFalsy();
  });

  it('can be constructed directly and initialized with init', async () => {
    const configurator = new FrameworkMockConfigurator();
    configurator.msal.setAccount({ name: 'Ada Lovelace' });

    const fusion = await init(configurator);

    expect(fusion.modules.auth.account?.name).toBe('Ada Lovelace');
  });
});
