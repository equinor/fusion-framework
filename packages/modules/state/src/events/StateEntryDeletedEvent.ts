/**
 * @fileoverview State entry deleted event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { AllowedValue } from '../types.js';
import type { StorageItem } from '../storage/types.js';

/**
 * Initialization parameters for state entry deleted events.
 *
 * @template T - The type of the allowed value stored in the item
 */
export type StateEntryDeletedEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  /** Internal Database ID */
  _id?: string;
  /** User-facing key */
  key: string;
  /** Storage item being deleted */
  item?: StorageItem<T>;
}>;

/**
 * Event dispatched when a state entry is deleted.
 *
 * @template T - The type of the allowed value stored in the item
 *
 * @example
 * ```typescript
 * eventBus.on('onState.deleted', (event) => {
 *   if (event instanceof StateEntryDeletedEvent) {
 *     console.log('Entry deleted:', event.key, event.item);
 *   }
 * });
 * ```
 */
export class StateEntryDeletedEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateEntryDeletedEventInit<T>
> {
  static readonly Type = 'onState.deleted';

  /**
   * Determines whether an unknown value is a state entry deleted event.
   * @param event - Value to inspect.
   * @returns Whether the value is a state entry deleted event.
   */
  static is(event: unknown): event is StateEntryDeletedEvent {
    // Accept actual event instances before checking structurally compatible values.
    if (event instanceof StateEntryDeletedEvent) {
      return true;
    }
    // Support events crossing package or serialization boundaries.
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateEntryDeletedEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateEntryDeletedEvent instance.
   *
   * @param args - Initialization arguments containing the storage item details
   */
  constructor(args: StateEntryDeletedEventInit<T>) {
    super(StateEntryDeletedEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onState.deleted': StateEntryDeletedEvent;
  }
}
