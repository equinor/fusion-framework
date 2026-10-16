import type { FusionModulesInstance } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';
import { enableNavigation } from '@equinor/fusion-framework-module-navigation';
import type { ModuleConfigType } from '@equinor/fusion-framework-module';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import type { IAppConfigurator } from './AppConfigurator.js';
import type { AppEnv } from './types.js';

/**
 * Enable the navigation module for a Fusion application using the strategy
 * supplied by the app initiator (`env.navigation`).
 *
 * Generated or hand-written startup only has to call this once; it does not need
 * to copy `env.basename` or choose a history.
 *
 * Precedence:
 * 1. Settings made in `configure` (explicit app configuration)
 * 2. The initiator strategy in `env.navigation` (`host` or `memory`)
 * 3. Standalone browser defaults when no initiator is supplied
 *
 * An explicit setting that violates a required host constraint (basename or
 * history) fails startup with a `NavigationInitiatorConflictError`.
 *
 * Import from `@equinor/fusion-framework-app/enable-navigation` or, for React
 * apps, `@equinor/fusion-framework-react-app/navigation`.
 *
 * @template M - Module tuple of the configurator
 * @template R - Parent framework instance type
 * @param configurator - The application configurator to register navigation on
 * @param env - The app environment carrying the initiator strategy
 * @param configure - Optional explicit navigation configuration
 *
 * @example
 * ```ts
 * import { enableAppNavigation } from '@equinor/fusion-framework-app/enable-navigation';
 *
 * export const configure: AppModuleInitiator = (configurator, { env }) => {
 *   enableAppNavigation(configurator, env);
 * };
 * ```
 */
export function enableAppNavigation<M extends AnyModule[], R extends FusionModulesInstance>(
  configurator: IAppConfigurator<M, R>,
  env: Pick<AppEnv, 'navigation'>,
  configure?: (config: ModuleConfigType<NavigationModule>) => void,
): void {
  enableNavigation(configurator, {
    initiator: env.navigation,
    configure: configure && ((config) => configure(config)),
  });
}

export default enableAppNavigation;
