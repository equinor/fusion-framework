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
        const config = await (args.config as ContextModuleConfigurator).createConfig(args);
        const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
        const parentProvider = (args.ref as ModulesInstance<[ContextModule]>)?.context;
        const provider = new ContextProvider({ config, event, parentContext: parentProvider });

        const subscription = new Subscription(() => provider.dispose());

        this.postInitialize = (args) =>
            new Observable((subscriber) => {
                const resolveInitialContext$ = config.resolveInitialContext
                    ? from(config.resolveInitialContext(args)).pipe(
                          filter((item): item is ContextItem => !!item),
                          switchMap((item) =>
                              args.modules.context.setCurrentContext(item, {
                                  validate: true,
                                  resolve: true,
                              }),
                          ),
                      )
                    : EMPTY;

                subscriber.add(
                    resolveInitialContext$
                        .pipe(
                            catchError((err) => {
                                console.warn(
                                    'ContextModule.postInitialize',
                                    'failed to resolve initial context',
                                    err,
                                );
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
                                if (config.connectParentContext !== false && parentProvider) {
                                    provider.connectParentContext(parentProvider);
                                }
                                subscriber.complete();
                            },
                        }),
                );
            });

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
