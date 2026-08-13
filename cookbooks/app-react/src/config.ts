import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Application module configuration.
 *
 * Endpoints defined in `app.config.ts` are automatically registered as named
 * HTTP clients — there is no need to call `configureHttpClient` here for those
 * endpoints. Use this callback for additional module setup such as lifecycle
 * hooks or clients that require custom transport behavior.
 *
 * @see {@link https://github.com/equinor/fusion-framework/blob/main/packages/modules/http/docs/client-configuration.md | HTTP client configuration}
 */
export const configure: AppModuleInitiator = (configurator, _env) => {
  /** print render environment arguments */
  //console.log('configuring application', env);

  /** callback when configurations is created */
  configurator.onConfigured((_config) => {
    // console.log('application config created', config);
  });

  /** callback when the application modules has initialized */
  configurator.onInitialized((_instance) => {
    // console.log('application config initialized', instance);
  });
};

export default configure;
