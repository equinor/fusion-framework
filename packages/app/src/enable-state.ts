import { enableStateModule } from '@equinor/fusion-framework-module-state';
import { PouchDbStorage } from '@equinor/fusion-framework-module-state/storage';
import type { IAppConfigurator } from './AppConfigurator';
import type { AnyModule } from '@equinor/fusion-framework-module';
import type { FusionModulesInstance } from '@equinor/fusion-framework';
import type { AppEnv } from './types';

// Application-specific database name for state management
const APP_DB_NAME = 'app_state';

/**
 * Enables state management for the application with persistent storage.
 *
 * This function configures the application to support state management with automatic
 * persistence across browser sessions. The state will be uniquely scoped to your application.
 *
 * @warning Storage is NOT encrypted. Do not store sensitive data such as passwords, tokens,
 * personal information, or any data that requires security protection.
 *
 * @see {@link https://github.com/equinor/fusion-framework/blob/main/packages/modules/state/README.md | State Module Documentation} for comprehensive usage examples and API reference.
 *
 * @typeParam M - Array of modules to be configured.
 * @typeParam R - The fusion modules instance type.
 * @typeParam E - The application environment type.
 * @param configurator - The application configurator to enable state management on.
 *
 * @example
 * ```typescript
 * import { enableState } from '@equinor/fusion-framework-app';
 *
 * // Enable state management in your app configurator
 * export const configure = (configurator) => {
 *   enableState(configurator);
 * };
 *
 * // Later in your app, access the state provider
 * const stateProvider = modules.state;
 * await stateProvider.storeItem({ key: 'user-preference', value: { theme: 'dark' } });
 * const item = await stateProvider.getItem('user-preference');
 * ```
 */
export function enableState<M extends AnyModule[], R extends FusionModulesInstance>(
  configurator: IAppConfigurator<M, R>,
): void {
  // Leverage the core state module with custom storage configuration
  enableStateModule(configurator, (config) => {
    // Use PouchDB with app-specific key prefix to ensure state isolation
    // The key_prefix prevents state collision between different apps using the same database
    const storage = new PouchDbStorage(APP_DB_NAME, { key_prefix: configurator.manifest.appKey });

    // Register the storage adapter with the state module configuration
    config.setStorage(storage);
  });
}
