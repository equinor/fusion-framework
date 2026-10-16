import type { FusionModulesInstance } from '@equinor/fusion-framework';
import type { AnyModule, ModuleConfigType } from '@equinor/fusion-framework-module';
import {
  enableNavigation,
  type NavigationModule,
} from '@equinor/fusion-framework-module-navigation';

import type { IWidgetConfigurator } from './WidgetConfigurator.js';
import type { WidgetEnv } from './types.js';

/**
 * Enable the navigation module for a widget with an isolated, per-instance
 * memory history.
 *
 * Each call to widget initialization creates a new memory history that is owned
 * (and disposed) by the navigation module. `window.location` is never read or
 * modified, and two widgets never share navigation state.
 *
 * Settings made in `configure` are explicit app configuration and take
 * precedence over the memory strategy.
 *
 * @template M - Module tuple of the configurator
 * @template R - Parent framework instance type
 * @param configurator - The widget configurator to register navigation on
 * @param env - The widget environment, optionally carrying `navigation` options
 * @param configure - Optional explicit navigation configuration
 *
 * @example
 * ```ts
 * const init = configureWidgetModules((configurator, { env }) => {
 *   enableWidgetNavigation(configurator, env);
 * });
 * ```
 */
export function enableWidgetNavigation<M extends AnyModule[], R extends FusionModulesInstance>(
  configurator: IWidgetConfigurator<M, R>,
  env: Pick<WidgetEnv, 'navigation'> = {},
  configure?: (config: ModuleConfigType<NavigationModule>) => void,
): void {
  enableNavigation(configurator, {
    initiator: { kind: 'memory', ...env.navigation },
    configure: configure && ((config) => configure(config)),
  });
}

export default enableWidgetNavigation;
