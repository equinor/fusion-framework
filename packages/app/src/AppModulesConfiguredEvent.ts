import type { ModulesConfigType, AnyModule } from '@equinor/fusion-framework-module';
import type { AppModules } from '@equinor/fusion-framework-module-app';
import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { AppModulesInitializedEvent } from './AppModulesInitializedEvent';

/**
 * Represents the initialization data for an event indicating that application modules have been configured.
 *
 * @template T - Array of additional modules configured in the application.
 * @extends FrameworkEventInit
 * @property {string} appKey - The unique key identifying the application.
 * @property {ModulesConfigType<AppModules<T>>} configs - The configuration objects for the specified application modules.
 */
type AppModulesConfiguredEventInit<T extends AnyModule[] | unknown = unknown> = FrameworkEventInit<{
  appKey: string;
  configs: ModulesConfigType<AppModules<T>>;
}>;

/**
 * Event emitted when application modules have been configured.
 *
 * @template T - An array of additional modules configured in the application.
 * @extends FrameworkEvent<AppModulesConfiguredEventInit<T>>
 */
export class AppModulesConfiguredEvent<
  T extends AnyModule[] | unknown = unknown,
> extends FrameworkEvent<AppModulesConfiguredEventInit<T>> {
  /**
   * Create an event describing configured application modules.
   *
   * @param init - Event initialization data containing the application key and module configs.
   */
  constructor(init: AppModulesConfiguredEventInit<T>) {
    super('onAppModulesConfigured', init);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onAppModulesConfigured: AppModulesConfiguredEvent;
    onAppModulesInitialized: AppModulesInitializedEvent;
  }
}
