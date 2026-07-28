import type { AppModuleInitiator } from '@equinor/fusion-framework-react-app';

/**
 * Logs application configuration lifecycle events for the cookbook.
 * @param configurator - Application configurator that emits lifecycle events.
 * @param env - Render environment passed to the application module.
 * @returns Nothing; lifecycle listeners are registered on the configurator.
 */
export const configure: AppModuleInitiator = (configurator, env) => {
  /** print render environment arguments */
  console.log('configuring application', env);

  /** callback when configurations is created */
  configurator.onConfigured((config) => {
    console.log('application config created', config);
  });

  /** callback when the application modules has initialized */
  configurator.onInitialized((instance) => {
    console.log('application config initialized', instance);
  });
};

export default configure;
