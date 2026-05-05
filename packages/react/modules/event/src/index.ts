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

export { EventConsumer, EventProvider } from './eventContext';

export { useEventProvider } from './useEventProvider';
export { useModulesEventProvider } from './useModulesEventProvider';
export { useEventHandler } from './useEventHandler';
export { useEventStream, type EventStream } from './useEventStream';
