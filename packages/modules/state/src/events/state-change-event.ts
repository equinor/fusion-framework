import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import type { StorageItem } from '../storage/types.js';

/**
 * Initialization parameters for storage change events.
 * Contains information about the storage item and operation context.
 *
 * @template T - The type of the allowed value stored in the item
 */
type StateChangeEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  _id?: string;           // Internal Database ID 
  key: string;            // User-facing key
  item?: StorageItem<T>;  // Storage item being changed
}>;

/**
 * Unique symbol to identify StateChangeEvent instances across JavaScript instances.
 * This provides a reliable way to identify StateChangeEvent objects even when
 * instanceof checks fail due to cross-instance scenarios (e.g., web workers, iframes).
 */
const STATE_CHANGE_EVENT_SYMBOL = Symbol.for('fusion-framework:state-change-event');

/**
 * Event class for state entry changes.
 * Dispatched when state entries are created, updated, or deleted.
 *
 * @template T - The type of the allowed value stored in the item
 */
export class StateChangeEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateChangeEventInit<T>
> {
  /**
   * Static event type constants for type checking and filtering.
   */
  static readonly Type = {
    /** Event type for state entry creation */
    Created: 'onState.created',
    /** Event type for state entry updates */
    Updated: 'onState.updated',
    /** Event type for state entry deletion */
    Deleted: 'onState.deleted',
  } as const;

  /**
   * Creates a new StateChangeEvent instance.
   * Adds a unique symbol marker for cross-instance identification.
   */
  constructor(type: string, args: StateChangeEventInit<T>) {
    super(type, args);
    // Add the unique symbol marker for cross-instance identification
    Object.defineProperty(this, STATE_CHANGE_EVENT_SYMBOL, {
      value: true,
      writable: false,
      enumerable: false,
      configurable: false,
    });
  }

  /**
   * Type guard that reliably identifies StateChangeEvent instances across JavaScript instances.
   * Uses multiple validation strategies to handle cross-instance scenarios.
   *
   * @param event - The event to check
   * @returns True if the event is a StateChangeEvent, false otherwise
   */
  static isStateChangeEvent(event: unknown): event is StateChangeEvent {
    // 1. Fast path: instanceof check (works within same JS instance)
    if (event instanceof StateChangeEvent) {
      return true;
    }

    // 2. Symbol-based identification (works across JS instances)
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      if (STATE_CHANGE_EVENT_SYMBOL in eventObj && eventObj[STATE_CHANGE_EVENT_SYMBOL] === true) {
        return true;
      }
      // 3. Rubber-Duck identification (works across JS instances)
      const type = (event as { type?: unknown })?.type;
      if (
        type === StateChangeEvent.Type.Created ||
        type === StateChangeEvent.Type.Updated ||
        type === StateChangeEvent.Type.Deleted
      ) {
        return 'detail' in event;
      }
    }


    return false;
  }

  /**
   * Creates an event for when a new state entry is created.
   *
   * @param args - The event initialization parameters including the storage item
   * @returns A new StorageChangeEvent instance for entry creation
   */
  static EntryCreated(args: StateChangeEventInit) {
    return new StateChangeEvent(StateChangeEvent.Type.Created, args);
  }

  /**
   * Creates an event for when an existing state entry is updated.
   *
   * @param args - The event initialization parameters including the updated storage item
   * @returns A new StorageChangeEvent instance for entry update
   */
  static EntryUpdated(args: StateChangeEventInit) {
    return new StateChangeEvent(StateChangeEvent.Type.Updated, args);
  }

  /**
   * Creates an event for when a state entry is deleted.
   *
   * @param args - The event initialization parameters including the deleted storage item
   * @returns A new StorageChangeEvent instance for entry deletion
   */
  static EntryDeleted(args: StateChangeEventInit) {
    return new StateChangeEvent(StateChangeEvent.Type.Deleted, args);
  }
}

/**
 * Module augmentation to register state change events in the global framework event map.
 * This allows the framework to recognize and handle these events throughout the application.
 */
declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    /** Event dispatched when a new state entry is created */
    'onState.created': StateChangeEvent;
    /** Event dispatched when an existing state entry is updated */
    'onState.updated': StateChangeEvent;
    /** Event dispatched when a state entry is deleted */
    'onState.deleted': StateChangeEvent;
  }
}
