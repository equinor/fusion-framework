import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Application module configuration.
 *
 * `my-api` is a custom endpoint supplied by `app.config.dev.ts`, so it does not need a
 * service-discovery client registration.
 *
 * `people` is the bundled `fusion` preset's own service. `mocks/people.mock.ts` merges
 * its `/persons/{azureId}` response without a local schema (see
 * `mergeServiceDefinitions` in `@equinor/fusion-openapi-mock-server`).
 * `aurora-api` is a pre-production service added to local discovery by
 * `mocks/aurora-api.mock.ts` until it is registered before release.
 *
 * `enableNavigation` registers the navigation module the `Router` (see `src/index.ts`) needs
 * for browser history and basename resolution.
 *
 * @see {@link https://github.com/equinor/fusion-framework/blob/main/packages/modules/http/docs/client-configuration.md | HTTP client configuration}
 */
export const configure: AppModuleInitiator = (configurator, { env }) => {
  enableNavigation(configurator, env.basename);

  configurator.useFrameworkServiceClient('people');
  configurator.useFrameworkServiceClient('aurora-api');
};

export default configure;
