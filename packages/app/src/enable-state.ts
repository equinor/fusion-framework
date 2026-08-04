import { enableStateModule } from '@equinor/fusion-framework-module-state';
import type { IStateModuleConfigurator } from '@equinor/fusion-framework-module-state';
import type { IAppConfigurator } from './AppConfigurator';
import type { AnyModule } from '@equinor/fusion-framework-module';
import type { FusionModulesInstance } from '@equinor/fusion-framework';

/**
 * Enables state management for the application with persistent storage.
 *
 * This is a thin, app-scoped convenience wrapper around `enableStateModule` — it registers
 * the state module on the app's configurator so app code can reach it via the app namespace,
 * and scopes the module's default storage to this app's own `manifest.appKey` (so unrelated
 * apps or widgets hosted alongside it never share its state). The state module resolves a
 * local PouchDB database, optionally synced with the Fusion App State backend when service
 * discovery and auth are configured; call `setStorage` on the configurator to override it.
 *
 * @warning Local storage is NOT encrypted. Do not store sensitive data such as passwords,
 * tokens, personal information, or any data that requires security protection.
 *
 * @see {@link https://github.com/equinor/fusion-framework/blob/main/packages/modules/state/README.md | State Module Documentation} for comprehensive usage examples and API reference.
 *
 * @template M - Array of modules to be configured.
 * @template R - The fusion modules instance type.
 * @param configurator - The application configurator to enable state management on.
 * @param configure - Optional config callback, receiving the module's `IStateModuleConfigurator`.
 *
 * @example
 * ```typescript
 * import { enableState } from '@equinor/fusion-framework-app';
 *
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
  configure?: (builder: IStateModuleConfigurator) => void | Promise<void>,
): void {
  enableStateModule(configurator, async (builder) => {
    builder.setName(configurator.manifest.appKey);
    await configure?.(builder);
  });
}
