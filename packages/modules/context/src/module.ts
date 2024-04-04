import { catchError, EMPTY, from, Observable, switchMap, filter, Subscription } from 'rxjs';

import { Module, ModulesInstance } from '@equinor/fusion-framework-module';

import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';
import { NavigationModule } from '@equinor/fusion-framework-module-navigation';

import { IContextModuleConfigurator, ContextModuleConfigurator } from './configurator';
import { IContextProvider, ContextProvider } from './ContextProvider';
import { ContextItem } from './types';

export type ContextModuleKey = 'context';

export const moduleKey: ContextModuleKey = 'context';

export type ContextModule = Module<
    ContextModuleKey,
    IContextProvider,
    IContextModuleConfigurator,
    [ServicesModule, EventModule, NavigationModule]
>;

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

        // setup post initialization to module
        this.postInitialize = (args) => {
            // create observable for resolving initial context
            return new Observable((subscriber) => {
                // resolve initial context if available from config if available
                const resolveInitialContext$ = config.resolveInitialContext
                    ? from(config.resolveInitialContext(args)).pipe(
                          // filter out invalid context items
                          filter((item): item is ContextItem => !!item),
                          // attempt to set the current context with validation and resolution
                          switchMap((item) =>
                              args.modules.context.setCurrentContext(item, {
                                  validate: true,
                                  resolve: true,
                              }),
                          ),
                      )
                    : EMPTY; // if no initial context is available, complete immediately

                // add teardown logic for the resolve initial context operation
                subscriber.add(
                    resolveInitialContext$
                        .pipe(
                            // handle errors during initial context resolution
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
                        // subscribe to the initial context resolution process
                        .subscribe({
                            next: (item) => {
                                console.debug(
                                    'ContextModule.postInitialize',
                                    `initial context was resolved to [${item ? item.id : 'none'}]`,
                                    item,
                                );
                            },
                            complete: () => {
                                // connect to parent context if configured to do so and a parent provider is available
                                if (config.connectParentContext !== false && parentProvider) {
                                    provider.connectParentContext(parentProvider);
                                }
                                subscriber.complete();
                            },
                        }),
                );
            });
        };

        // add teardown logic to module for cleanup
        this.dispose = () => subscription.unsubscribe();

        // return the created context provider
        return provider;
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        context: ContextModule;
    }
}

export default module;
