import type { ModulesConfigType, AnyModule } from '@equinor/fusion-framework-module';
import type { AppModules, AppModulesInstance } from '@equinor/fusion-framework-module-app';
import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

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
 * @typeParam T - An array of additional modules configured in the application.
 * @extends FrameworkEvent<AppModulesConfiguredEventInit<T>>
 */
export class AppModulesConfiguredEvent<
  T extends AnyModule[] | unknown = unknown,
> extends FrameworkEvent<AppModulesConfiguredEventInit<T>> {
  constructor(init: AppModulesConfiguredEventInit<T>) {
    super('onAppModulesConfigured', init);
  }
}

/**
 * Event initialization type for the "AppModulesInitialized" event.
 *
 * @template T - An array of module types extending `AnyModule`. Defaults to an empty array.
 * @remarks
 * This type is used to initialize framework events that signal the completion of app module initialization.
 * It includes the application key and the instance of initialized modules.
 *
 * @property appKey - The unique key identifying the application.
 * @property modules - The instance containing all initialized application modules.
 */
type AppModulesInitializedEventInit<T extends AnyModule[] | unknown = unknown> =
  FrameworkEventInit<{
    appKey: string;
    modules: AppModulesInstance<T>;
  }>;

/**
 * Event triggered when application modules have been initialized.
 *
 * @typeParam T - An array of modules extending `AnyModule`. Defaults to an empty array.
 * @extends FrameworkEvent<AppModulesInitializedEventInit<T>>
 *
 * @example
 * ```typescript
 * const event = new AppModulesInitializedEvent({ modules: [...] });
 * ```
 */
export class AppModulesInitializedEvent<
  T extends AnyModule[] | unknown = unknown,
> extends FrameworkEvent<AppModulesInitializedEventInit<T>> {
  constructor(init: AppModulesInitializedEventInit<T>) {
    super('onAppModulesInitialized', init);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    onAppModulesConfigured: AppModulesConfiguredEvent;
    onAppModulesInitialized: AppModulesInitializedEvent;
  }
}
