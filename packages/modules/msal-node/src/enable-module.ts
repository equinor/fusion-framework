import type { IModuleConfigurator, IModulesConfigurator } from '@equinor/fusion-framework-module';
import { module, type MsalNodeModule } from './module.js';

/**
 * Enables the MSAL Node module by registering its configuration with the provided modules configurator.
 *
 * This function should be called to add the MSAL Node authentication module to a Fusion Framework application.
 * It accepts a configurator instance and a configuration function, which is used to define the module's behavior and settings.
 *
 * @param configurator - The modules configurator instance used to register the MSAL Node module.
 * @param configure - A configuration function for customizing the module (e.g., setting client ID, tenant ID, mode).
 *
 * @see IAuthProvider for the authentication provider interface exposed by the module.
 * @see IAuthConfigurator for the configuration builder interface used in the configure callback.
 *
 * @example
 * ```typescript
 * enableModule(configurator, (builder) => {
 *   builder.setMode('interactive');
 *   builder.setClientConfig('your-tenant-id', 'your-client-id');
 * });
 * ```
 */
export const enableModule = (
  // biome-ignore lint/suspicious/noExplicitAny: @todo -remove when types sorted in provider interface
  configurator: IModulesConfigurator<any, any>,
  configure: IModuleConfigurator<MsalNodeModule>['configure'],
) => {
  configurator.addConfig({
    module,
    configure,
  });
};

export default enableModule;
