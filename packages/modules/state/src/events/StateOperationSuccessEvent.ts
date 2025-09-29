import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

/**
 * Initialization parameters for successful state operation events.
 */
export type StateOperationEventSuccessInit = FrameworkEventInit<{
  /** The function name that was executed */
  fn: string;
  /** Optional success message */
  message?: string;
  /** Arguments passed to the function */
  args?: unknown[];
  /** The result of the operation */
  result?: unknown;
  /** Performance metric (e.g., execution time in ms) */
  metric?: number;
}>;

/**
 * Event dispatched when a state operation completes successfully.
 *
 * @example
 * ```typescript
 * eventBus.on('onStateOperation.success', (event) => {
 *   if (event instanceof StateOperationEventSuccess) {
 *     console.log('Operation succeeded:', event.fn);
 *   }
 * });
 * ```
 */
export class StateOperationSuccessEvent extends FrameworkEvent<StateOperationEventSuccessInit> {
  static readonly Type = 'onStateOperation.success' as const;
  static is(event: unknown): event is StateOperationSuccessEvent {
    if (event instanceof StateOperationSuccessEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateOperationSuccessEvent.Type && 'detail' in eventObj;
    }
    return false;
  }
  /**
   * Creates a new StateOperationEventSuccess instance.
   *
   * @param args - Initialization arguments containing operation details
   */
  constructor(args: StateOperationEventSuccessInit) {
    super(StateOperationSuccessEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateOperation.success': StateOperationSuccessEvent;
  }
}
