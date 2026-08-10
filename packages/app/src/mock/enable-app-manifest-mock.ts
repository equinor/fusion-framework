import type { FrameworkMockConfigurator } from '@equinor/fusion-framework/mock';
import { enableAppModule, type AppModule } from '@equinor/fusion-framework-module-app';
import { MockAppClient } from '@equinor/fusion-framework-module-app/mock';

import type { AppEnv } from '../types.js';

/**
 * Enables the `app` module on a parent framework configurator, wrapping its
 * client in a {@link MockAppClient} so this app's manifest and config resolve
 * locally.
 *
 * @remarks
 * The underlying http client is still resolved the same way `AppConfigurator`
 * resolves it (a pre-configured client, falling back to service discovery), so
 * a caller pointing `serviceDiscovery` at something else — e.g. a real local
 * mock server — is honored for every request `MockAppClient` doesn't answer
 * itself. {@link mockAppModules} uses this to wire its zero-config default
 * parent; call it directly when building a custom parent (via
 * {@link mockFramework}) that also needs this app's own manifest servable.
 *
 * @param configurator - The parent framework's mock configurator, with `app` in its module set.
 * @param env - The application environment whose manifest (and optional config) should be served.
 * @template TEnv - The application environment descriptor.
 *
 * @example Custom service discovery, same manifest resolution
 * ```typescript
 * const fusion = await mockFramework<[AppModule]>((configurator) => {
 *   configurator.serviceDiscovery.setBaseUri('http://localhost:9999');
 *   enableAppManifestMock(configurator, env);
 * });
 * const modules = await mockAppModules(undefined, env, fusion);
 * ```
 */
export function enableAppManifestMock<TEnv extends AppEnv>(
  configurator: FrameworkMockConfigurator<[AppModule]>,
  env: TEnv,
): void {
  enableAppModule(configurator, (builder) => {
    builder.setClient(async ({ requireInstance }) => {
      const http = await requireInstance('http');
      const client = http.hasClient('apps')
        ? http.createClient('apps')
        : await (await requireInstance('serviceDiscovery')).createClient('apps');
      return new MockAppClient(client, env.manifest, env.config);
    });
  });
}

export default enableAppManifestMock;
