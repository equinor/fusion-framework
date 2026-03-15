import type { Module, ModuleInstance, ModulesInstanceType } from '@equinor/fusion-framework-module';
import type { FrameworkEvent, FrameworkEventInit } from './event';
import type { IEventModuleConfigurator } from './configurator';
import { EventModuleProvider, type IEventModuleProvider } from './provider';

/** Module key used to identify the event module in the Fusion module system. */
export const moduleKey = 'event';

/** Type alias for the event module definition. */
export type EventModule = Module<typeof moduleKey, IEventModuleProvider, IEventModuleConfigurator>;

/**
 * Event type dispatched when all framework modules have finished loading.
 *
 * The `detail` payload contains the full `ModuleInstance` map and the
 * `source` is the {@link EventModuleProvider} that dispatched the event.
 */
export type FrameworkEventModuleLoadedEvent = FrameworkEvent<
  FrameworkEventInit<ModuleInstance, EventModuleProvider>
>;

/**
 * Event module definition for the Fusion Framework.
 *
 * Handles configuration, initialization, post-initialization event dispatch
 * (`onModulesLoaded`), and disposal of the {@link EventModuleProvider}.
 *
 * When a parent module instance with an event provider is available, events
 * automatically bubble to it.
 */
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
  postInitialize: async ({ instance, modules }) => {
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
