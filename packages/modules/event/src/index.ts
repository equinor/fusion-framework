/**
 * Event module for the Fusion Framework.
 *
 * Provides a typed, observable event system for cross-module communication.
 * Modules dispatch {@link FrameworkEvent} instances through the
 * {@link IEventModuleProvider} and consumers subscribe with type-safe handlers.
 *
 * @see {@link EventModule} for the module definition.
 * @see {@link filterEvent} to filter event streams by type.
 *
 * @packageDocumentation
 */
export { FrameworkEvent } from './event';
export type {
  IFrameworkEvent,
  FrameworkEventDetail,
  FrameworkEventInit,
  FrameworkEventSource,
  FrameworkEventMap,
  FrameworkEventHandler,
  FrameworkEventInitType,
} from './event';

export { IEventModuleConfigurator } from './configurator';
export { IEventModuleProvider, EventModuleProvider } from './provider';
export { EventModule, moduleKey as eventModuleKey } from './module';

export { filterEvent } from './filter-event';

export { default } from './module';
