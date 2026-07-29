import type { ModulesConfigurator, AnyModule } from '@equinor/fusion-framework-module';

import { configureFramework, type FusionFrameworkSettings } from './configure-framework.js';
import type { FusionFramework, Modules } from './fusion-env.js';

/**
 * Initializes the Fusion Framework with the provided settings.
 *
 * This function configures HTTP, service discovery, and authentication modules
 * based on the supplied configuration. It supports multiple authentication modes
 * and allows customization of service discovery endpoints and scopes.
 *
 * When no `configure` callback is provided (or `TExtra` defaults to `[]`) the
 * return type is {@link FusionFramework}.  Pass a typed `configure` callback to
 * extend the instance with additional modules:
 *
 * @template TExtra - Tuple of additional module types added via `configure`.
 *   Defaults to `[]`, which means the return type is exactly {@link FusionFramework}.
 *
 * @param config - The settings for framework initialization.
 * @param configure - Optional callback to add or further configure modules.
 *   Receives a configurator already set up with the base {@link Modules}.
 * @returns A promise resolving to the initialized Fusion Framework instance,
 *   typed as `ModulesInstance<[...Modules, ...TExtra]>`.
 * @throws Will throw if required authentication parameters are missing.
 *
 * @example Basic usage (returns FusionFramework)
 * ```typescript
 * const framework = await initializeFramework({ env, auth });
 * ```
 *
 * @example With extra modules
 * ```typescript
 * const framework = await initializeFramework<[AiModule]>(
 *   { env, auth },
 *   (configurator) => enableAI(configurator),
 * );
 * framework.ai.useModel('gpt-4.1');
 * ```
 */
export const initializeFramework = async <TExtra extends Array<AnyModule> = []>(
  config: FusionFrameworkSettings,
  configure?: (configurator: ModulesConfigurator<[...Modules, ...TExtra]>) => void,
): Promise<FusionFramework<TExtra>> => {
  // Get the configured framework
  const configurator = configureFramework(config);

  // Apply additional configuration if provided
  if (configure) {
    configure(configurator as ModulesConfigurator<[...Modules, ...TExtra]>);
  }

  // Initialize all configured modules and return the framework instance
  const instance = await configurator.initialize();

  return instance as FusionFramework<TExtra>;
};
