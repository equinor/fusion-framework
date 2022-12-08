export { FrameworkEvent } from './event';
export type {
    IFrameworkEvent,
    FrameworkEventDetail,
    FrameworkEventInit,
    FrameworkEventSource,
    FrameworkEventMap,
    FrameworkEventHandler,
} from './event';

export { IEventModuleConfigurator } from './configurator';
export { IEventModuleProvider, EventModuleProvider } from './provider';
export { EventModule, moduleKey as eventModuleKey } from './module';

export { filterEvent } from './filter-event';

export { default } from './module';
