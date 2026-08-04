import type { AnyModule } from '@equinor/fusion-framework-module';
import type { AppModulesInstance } from '@equinor/fusion-framework-module-app';
import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

/**
 * Event initialization type for the "AppModulesInitialized" event.
 *
 * @template T - An array of module types extending `AnyModule`. Defaults to an empty array.
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
 * @template T - An array of modules extending `AnyModule`. Defaults to an empty array.
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
  /**
   * Create an event describing initialized application modules.
   *
   * @param init - Event initialization data containing the application key and module instance.
   */
  constructor(init: AppModulesInitializedEventInit<T>) {
    super('onAppModulesInitialized', init);
  }
}