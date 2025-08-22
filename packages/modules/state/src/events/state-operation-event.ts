import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

/**
 * Initialization parameters for successful state operation events.
 */
type StateOperationEventSuccessInit = FrameworkEventInit<{
  fn: string;
  message?: string;
  args?: unknown[];
  result?: unknown;
  metric?: number;
}>;

/**
 * Initialization parameters for failed state operation events.
 */
type StateOperationEventFailureInit = FrameworkEventInit<{ fn: string; error: unknown }>;

/**
 * Union type for all state operation event initialization parameters.
 */
type StateOperationEventInit = StateOperationEventSuccessInit | StateOperationEventFailureInit;

/**
 * Event class for state operations.
 * Dispatched when state operations complete (either successfully or with failure).
 *
 * @template TInit - The initialization parameters type
 */
export class StateOperationEvent extends FrameworkEvent<StateOperationEventInit> {
  /**
   * Static event type constants for type checking and filtering.
   */
  static readonly Type = {
    /** Event type for successful state operations */
    Success: 'onStateOperation.success',
    /** Event type for failed state operations */
    Failure: 'onStateOperation.failure',
  } as const;

  /**
   * Creates a successful state operation event.
   *
   * @param args - The event initialization parameters including operation details
   * @returns A new StateOperationEvent instance for successful operations
   */
  static Success(args: StateOperationEventSuccessInit) {
    return new StateOperationEvent(StateOperationEvent.Type.Success, args);
  }

  /**
   * Creates a failed state operation event.
   *
   * @param args - The event initialization parameters including error details
   * @returns A new StateOperationEvent instance for failed operations
   */
  static Failure(args: StateOperationEventInit) {
    return new StateOperationEvent(StateOperationEvent.Type.Failure, args);
  }
}

/**
 * Module augmentation to register state operation events in the global framework event map.
 * This allows the framework to recognize and handle these events throughout the application.
 */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Event dispatched when a state operation completes successfully */
    'onStateOperation.success': StateOperationEvent;
    /** Event dispatched when a state operation fails */
    'onStateOperation.failure': StateOperationEvent;
  }
}
