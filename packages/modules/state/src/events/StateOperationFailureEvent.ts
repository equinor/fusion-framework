import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

/**
 * Initialization parameters for failed state operation events.
 */
export type StateOperationEventFailureInit = FrameworkEventInit<{
  /** The function name that failed */
  fn: string;
  /** Arguments passed to the function */
  args?: unknown[];
  /** Performance metric (e.g., execution time in ms) */
  metric?: number;
  /** The error that occurred */
  error: unknown;
}>;

/**
 * Event dispatched when a state operation fails.
 *
 * @example
 * ```typescript
 * eventBus.on('onStateOperation.failure', (event) => {
 *   if (event instanceof StateOperationEventFailure) {
 *     console.error('Operation failed:', event.fn, event.error);
 *   }
 * });
 * ```
 */
export class StateOperationFailureEvent extends FrameworkEvent<StateOperationEventFailureInit> {
  static readonly Type = 'onStateOperation.failure' as const;
  static is(event: unknown): event is StateOperationFailureEvent {
    if (event instanceof StateOperationFailureEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateOperationFailureEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateOperationEventFailure instance.
   *
   * @param args - Initialization arguments containing error details
   */
  constructor(args: StateOperationEventFailureInit) {
    super(StateOperationFailureEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateOperation.failure': StateOperationFailureEvent;
  }
}
