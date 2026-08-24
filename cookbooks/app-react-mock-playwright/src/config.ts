import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Application module configuration.
 *
 * `my-api` is registered from the mock server's service-discovery response rather than a static
 * endpoint, so `useFrameworkServiceClient` resolves its base URI at initialization time.
 *
 * `people` is the bundled `fusion` preset's own service. `mocks/people.overrides.ts` overrides
 * its `/persons/{azureId}` response without a local `people.openapi.json` (see
 * `mergeServiceDefinitions` in `@equinor/fusion-openapi-mock-server`).
 *
 * `enableNavigation` registers the navigation module the `Router` (see `src/index.ts`) needs
 * for browser history and basename resolution.
 *
 * @see {@link https://github.com/equinor/fusion-framework/blob/main/packages/modules/http/docs/client-configuration.md | HTTP client configuration}
 */
export const configure: AppModuleInitiator = (configurator, { env }) => {
  enableNavigation(configurator, env.basename);

  configurator.useFrameworkServiceClient('my-api');
  configurator.useFrameworkServiceClient('people');
};

export default configure;
