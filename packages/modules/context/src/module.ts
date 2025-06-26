import { catchError, EMPTY, from, Observable, switchMap, filter, Subscription } from 'rxjs';

import type { Module, ModulesInstance } from '@equinor/fusion-framework-module';

import type { EventModule } from '@equinor/fusion-framework-module-event';
import type { ServicesModule } from '@equinor/fusion-framework-module-services';
import type { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { type IContextModuleConfigurator, ContextModuleConfigurator } from './configurator';
import { type IContextProvider, ContextProvider } from './ContextProvider';
import type { ContextItem } from './types';

export type ContextModuleKey = 'context';

export const moduleKey: ContextModuleKey = 'context';

/**
 * Represents a module for managing context within the framework.
 *
 * @typeParam ContextModuleKey - The unique key identifying the context module.
 * @typeParam IContextProvider - The provider interface for context-related services.
 * @typeParam IContextModuleConfigurator - The configurator interface for customizing the context module.
 * @typeParam [ServicesModule, EventModule, NavigationModule] - The tuple of dependent modules required by the context module.
 *
 * @see Module
 */
export type ContextModule = Module<
  ContextModuleKey,
  IContextProvider,
  IContextModuleConfigurator,
  [ServicesModule, EventModule, NavigationModule]
>;

/**
 * The `module` object implements the `ContextModule` interface and provides the configuration,
 * initialization, and lifecycle management for the context module within the Fusion Framework.
 *
 * @remarks
 * - The `configure` method returns a new `ContextModuleConfigurator` for module configuration.
 * - The `initialize` method asynchronously creates a `ContextProvider` using the provided configuration,
 *   optional event module, and optional parent context provider. It also sets up resource disposal and
 *   post-initialization logic.
 * - The `postInitialize` function (attached during initialization) resolves the initial context if available,
 *   sets it as the current context, and connects to the parent context provider if configured to do so.
 * - The `dispose` function ensures proper cleanup by unsubscribing from the provider's subscription.
 *
 * @property {string} name - The unique key identifying the module.
 * @method configure - Returns a new instance of `ContextModuleConfigurator` for configuring the module.
 * @method initialize - Asynchronously initializes the context provider, sets up context resolution,
 *   and manages lifecycle hooks.
 * @see ContextModule
 * @see ContextModuleConfigurator
 * @see ContextProvider
 */
export const module: ContextModule = {
  name: moduleKey,
  configure: () => new ContextModuleConfigurator(),
  initialize: async function (args) {
    // create config from configurator
    const config = await (args.config as ContextModuleConfigurator).createConfig(args);

    // get event module if available
    const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;

    // get parent context provider if available
    const parentProvider = (args.ref as ModulesInstance<[ContextModule]>)?.context;

    // create context provider
    const provider = new ContextProvider({ config, event, parentContext: parentProvider });

    // create subscription for disposing the provider
    const subscription = new Subscription(() => provider.dispose());

    // setup post initialize to module
    this.postInitialize = (args) =>
      // create observable for resolving initial context
      new Observable((subscriber) => {
        // resolve initial context if available from config if available
        const resolveInitialContext$ = config.resolveInitialContext
          ? from(config.resolveInitialContext(args)).pipe(
              // filter out invalid context items
              filter((item): item is ContextItem => !!item),
              switchMap((item) =>
                // set current context with validation and resolution
                args.modules.context.setCurrentContext(item, {
                  validate: true,
                  resolve: true,
                }),
              ),
            )
          : EMPTY; // if no initial context is available, complete immediately

        // add teardown to resolve initial context
        subscriber.add(
          resolveInitialContext$
            .pipe(
              catchError((err) => {
                console.warn(
                  'ContextModule.postInitialize',
                  'failed to resolve initial context',
                  err,
                );
                // failed to resolve initial context, complete immediately
                return EMPTY;
              }),
            )
            .subscribe({
              next: (item) => {
                console.debug(
                  'ContextModule.postInitialize',
                  `initial context was resolved to [${item ? item.id : 'none'}]`,
                  item,
                );
              },
              complete: () => {
                // connect parent context if available when stream completes
                if (config.connectParentContext !== false && parentProvider) {
                  provider.connectParentContext(parentProvider);
                }
                subscriber.complete();
              },
            }),
        );
      });

    // add teardown to module
    this.dispose = () => subscription.unsubscribe();

    return provider;
  },
};

declare module '@equinor/fusion-framework-module' {
  interface Modules {
    context: ContextModule;
  }
}

export default module;
