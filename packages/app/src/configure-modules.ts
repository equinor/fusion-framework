/**
 * @fileoverview Application module configuration factory
 *
 * Provides the core factory function for configuring and initializing
 * application-specific modules in the Fusion framework.
 */

import type { Fusion } from '@equinor/fusion-framework';
import type { AnyModule } from '@equinor/fusion-framework-module';

import {
  AppConfigurator,
  type IAppConfigurator,
  type AppConfiguratorConstructor,
} from './AppConfigurator';

import type { AppModulesInstance, AppModuleInitiator, AppEnv, AppModuleInitArgs } from './types';
import { AppConfiguratorError } from './error';

/**
 * Configuration options for the configureModules function.
 *
 * Supports object-based configuration with optional callback and custom configurator.
 *
 * @template TModules - Additional modules beyond default app modules
 * @template TRef - Fusion framework instance type
 * @template TEnv - Application environment type
 */
export type ConfigureModulesOptions<
  TModules extends readonly AnyModule[] = [],
  TRef extends Fusion = Fusion,
  TEnv extends AppEnv = AppEnv,
> = {
  /** Optional configuration callback function */
  configure?: AppModuleInitiator<TModules, TRef, TEnv>;
  /** Optional custom AppConfigurator class */
  configurator?: AppConfiguratorConstructor<TModules, TRef['modules'], TEnv>;
};

/**
 * Input arguments for the configureModules function.
 *
 * Union type supporting both functional and object-based configuration approaches.
 *
 * @template TModules - Additional modules beyond default app modules
 * @template TRef - Fusion framework instance type
 * @template TEnv - Application environment type
 */
export type ConfigureModulesArgs<
  TModules extends readonly AnyModule[] = [],
  TRef extends Fusion = Fusion,
  TEnv extends AppEnv = AppEnv,
> = AppModuleInitiator<TModules, TRef, TEnv> | ConfigureModulesOptions<TModules, TRef, TEnv>;

/**
 * Creates a factory function for initializing and configuring application modules.
 *
 * Provides a flexible way to set up application-specific modules that extend
 * the base Fusion framework. Supports both callback-based configuration and
 * advanced dependency injection patterns.
 *
 * @template TModules - Additional modules beyond default app modules
 * @template TRef - Fusion framework instance type
 * @template TEnv - Application environment type
 *
 * @param args - Configuration callback function or options object
 * @returns Factory function that initializes configured modules
 *
 * @throws {AppConfiguratorError} When configuration or initialization fails
 *
 * @example Basic usage
 * ```ts
 * const initialize = configureModules((configurator, { fusion, env }) => {
 *   configurator.configure(myCustomModule);
 *   configurator.configureHttpClient('my-api', {
 *     baseUri: env.config?.apiUrl,
 *     defaultScopes: ['api://my-app/.default']
 *   });
 * });
 *
 * const modules = await initialize({ fusion, env });
 * ```
 */
export const configureModules = <
  TModules extends readonly AnyModule[] = [],
  TRef extends Fusion = Fusion,
  TEnv extends AppEnv = AppEnv,
>(
  args?: ConfigureModulesArgs<TModules, TRef, TEnv>,
): ((args: AppModuleInitArgs<TRef, TEnv>) => Promise<AppModulesInstance<TModules>>) => {
  // Determine if args is a function (backward compatibility) or an options object
  const isFunction = typeof args === 'function';
  const cb = isFunction ? args : args?.configure;
  const configuratorClass = isFunction ? undefined : args?.configurator;

  // Support dependency injection of custom configurator classes
  const ConfiguratorClass = configuratorClass || AppConfigurator;

  // Return the factory function that consumers will call
  return async (args: AppModuleInitArgs<TRef, TEnv>): Promise<AppModulesInstance<TModules>> => {
    const {
      fusion: { modules: refModules },
      env,
    } = args;

    // Create configurator instance with access to fusion modules
    // Type assertion is necessary due to complex generic relationships
    const configurator = new ConfiguratorClass(env, refModules) as IAppConfigurator<
      TModules,
      TRef['modules']
    >;

    // Execute user configuration callback if provided
    if (cb) {
      try {
        await Promise.resolve(cb(configurator, args));
      } catch (error) {
        throw new AppConfiguratorError(
          'Failed to execute configuration callback',
          'configuration',
          error,
        );
      }
    }

    // Initialize configured modules
    try {
      const modules = await configurator.initialize(refModules);
      return modules;
    } catch (error) {
      throw new AppConfiguratorError(
        'Failed to initialize application modules',
        'initialization',
        error,
      );
    }
  };
};

export default configureModules;
