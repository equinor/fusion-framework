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
export { FrameworkEvent } from './FrameworkEvent.js';
export type {
  IFrameworkEvent,
  FrameworkEventDetail,
  FrameworkEventInit,
  FrameworkEventSource,
  FrameworkEventMap,
  FrameworkEventHandler,
  FrameworkEventInitType,
} from './FrameworkEvent.js';

import type { EventModuleConfig } from './EventModuleConfigurator.js';

export { EventModuleConfig, EventModuleConfigurator } from './EventModuleConfigurator.js';

/** @deprecated Since 6.1.0. Use {@link EventModuleConfig} instead. */
export type IEventModuleConfigurator = EventModuleConfig;

export { IEventModuleProvider, EventModuleProvider } from './EventModuleProvider.js';
export { EventModule, moduleKey as eventModuleKey } from './module.js';

export { filterEvent } from './operators/filter-event.js';

export { default } from './module.js';
