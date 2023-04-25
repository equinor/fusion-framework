import { Module, ModulesInstance } from '@equinor/fusion-framework-module';

import { EventModule } from '@equinor/fusion-framework-module-event';
import { ServicesModule } from '@equinor/fusion-framework-module-services';

import { IContextModuleConfigurator, ContextModuleConfigurator } from './configurator';
import { IContextProvider, ContextProvider } from './ContextProvider';

export type ContextModuleKey = 'context';

export const moduleKey: ContextModuleKey = 'context';

export type ContextModule = Module<
    ContextModuleKey,
    IContextProvider,
    IContextModuleConfigurator,
    [ServicesModule, EventModule]
>;

export const module: ContextModule = {
    name: moduleKey,
    configure: () => new ContextModuleConfigurator(),
    initialize: async (args) => {
        const config = await (args.config as ContextModuleConfigurator).createConfig(args);
        const event = args.hasModule('event') ? await args.requireInstance('event') : undefined;
        const parentProvider = (args.ref as ModulesInstance<[ContextModule]>)?.context;
        const provider = new ContextProvider({ config, event, parentContext: parentProvider });

        // TODO add option for skipping this step
        if (parentProvider) {
            try {
                await provider.connectParentContextAsync(parentProvider, {
                    setCurrent: !config.skipInitialContext,
                });
            } catch (err) {
                console.warn('provider.connectParentContext', 'failed to set parent context', err);
            }
        }

        return provider;
    },

    dispose: (args) => {
        (args.instance as ContextProvider).dispose();
    },
};

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        context: ContextModule;
    }
}

export default module;
