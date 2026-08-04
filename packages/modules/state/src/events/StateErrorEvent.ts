import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { StorageError } from '../storage/StorageError.js';

/**
 * Initialization parameters for storage error events.
 * Contains error information and optional context about the failed operation.
 *
 * @template T - The type of the storage error
 */
type StateErrorEventInit<T extends StorageError = StorageError> = FrameworkEventInit<{
  _id?: string;
  key?: string;
  error: T;
}>;

/**
 * Event class for state operation errors.
 * Dispatched when errors occur during state operations.
 *
 * @template T - The type of the storage error (defaults to StorageError)
 */
export class StateErrorEvent<T extends StorageError = StorageError> extends FrameworkEvent<
  StateErrorEventInit<T>
> {
  /**
   * Static event type constants for type checking and filtering.
   */
  static readonly Type = {
    /** Event type for state operation errors */
    Error: 'onState.error',
  } as const;

  /**
   * Determines whether an unknown value is a state error event.
   * @param event - Value to inspect.
   * @returns Whether the value is a state error event.
   */
  static is(event: unknown): event is StateErrorEvent {
    // Accept actual event instances before checking structurally compatible values.
    if (event instanceof StateErrorEvent) {
      return true;
    }
    // Support events crossing package or serialization boundaries.
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateErrorEvent.Type.Error && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a state error event from initialization details.
   * @param args - Initialization details for the error event.
   */
  constructor(args: StateErrorEventInit<T>) {
    super(StateErrorEvent.Type.Error, args);
  }
}

/**
 * Module augmentation to register state error events in the global framework event map.
 * This allows the framework to recognize and handle error events throughout the application.
 */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Event dispatched when an error occurs during a state operation */
    'onState.error': StateErrorEvent;
  }
}
