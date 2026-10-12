/**
 * React integration for the Fusion event module.
 *
 * Provides hooks ({@link useEventHandler}, {@link useEventStream}) and
 * React context components ({@link EventConsumer}, {@link EventProvider})
 * for subscribing to and dispatching framework events from React components.
 *
 * @packageDocumentation
 */
export * from '@equinor/fusion-framework-module-event';

export { EventConsumer, EventProvider } from './event-context-components.js';

export { useEventProvider } from './useEventProvider.js';
export { useModulesEventProvider } from './useModulesEventProvider.js';
export { useEventHandler } from './useEventHandler.js';
export { useEventStream, type EventStream } from './useEventStream.js';
