import { Module, ModuleInstance, ModulesInstanceType } from '@equinor/fusion-framework-module';
import { FrameworkEvent, FrameworkEventInit } from 'event';
import { IEventModuleConfigurator } from './configurator';
import { EventModuleProvider, IEventModuleProvider } from './provider';

export const moduleKey = 'event';

export type EventModule = Module<typeof moduleKey, IEventModuleProvider, IEventModuleConfigurator>;

export type FrameworkEventModuleLoadedEvent = FrameworkEvent<
    FrameworkEventInit<ModuleInstance, EventModuleProvider>
>;

export const module: EventModule = {
    name: moduleKey,
    configure: (ref?: Partial<ModulesInstanceType<[EventModule]>>) => {
        const configurator = {} as IEventModuleConfigurator;
        const parentProvider = ref?.event;
        if (parentProvider) {
            configurator.onBubble = async (e) => {
                await parentProvider.dispatchEvent(e);
            };
        }
        return configurator;
    },
    initialize: ({ config }) => new EventModuleProvider(config),
    postInitialize({ instance, modules }) {
        instance.dispatchEvent('onModulesLoaded', { detail: modules, source: instance });
    },
    dispose({ instance }) {
        instance.dispose();
    },
};

export default module;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare interface ModuleEventMap {
    onModulesLoaded: FrameworkEventModuleLoadedEvent;
}

declare module '@equinor/fusion-framework-module' {
    interface Modules {
        event: EventModule;
    }
}
