import type { IModulesConfigurator } from '@equinor/fusion-framework-module';
import { module } from './module';
import type { AppConfigurator } from './AppConfigurator';

/**
 * Registers the app module with a framework configurator.
 *
 * Call this during framework setup to enable application loading, manifest fetching,
 * configuration resolution, and per-user settings management.
 *
 * @param configurator - The framework modules configurator to register the app module with.
 * @param callback - Optional callback to customize the {@link AppConfigurator} before initialization
 *   (e.g., override the HTTP client or set a custom asset URI).
 *
 * @example
 * ```ts
 * import { enableAppModule } from '@equinor/fusion-framework-module-app';
 *
 * export const configure = async (configurator: FrameworkConfigurator) => {
 *   enableAppModule(configurator, (builder) => {
 *     builder.setAssetUri('/custom-proxy');
 *   });
 * };
 * ```
 */
export const enableAppModule = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  configurator: IModulesConfigurator<any, any>,
  callback?: (builder: AppConfigurator) => void | Promise<void>,
): void => {
  configurator.addConfig({
    module,
    configure: async (configurator) => {
      if (callback) {
        Promise.resolve(callback(configurator));
      }
    },
  });
};
