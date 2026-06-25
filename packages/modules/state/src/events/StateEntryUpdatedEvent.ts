/**
 * @fileoverview State entry updated event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import type { StorageItem } from '../storage/types.js';

/**
 * Initialization parameters for state entry updated events.
 *
 * @template T - The type of the allowed value stored in the item
 */
export type StateEntryUpdatedEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  /** Internal Database ID */
  _id?: string;
  /** User-facing key */
  key: string;
  /** Storage item being updated */
  item?: StorageItem<T>;
}>;

/**
 * Event dispatched when an existing state entry is updated.
 *
 * @template T - The type of the allowed value stored in the item
 *
 * @example
 * ```typescript
 * eventBus.on('onState.updated', (event) => {
 *   if (event instanceof StateEntryUpdatedEvent) {
 *     console.log('Entry updated:', event.key, event.item);
 *   }
 * });
 * ```
 */
export class StateEntryUpdatedEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateEntryUpdatedEventInit<T>
> {
  static readonly Type = 'onState.updated';

  static is(event: unknown): event is StateEntryUpdatedEvent {
    if (event instanceof StateEntryUpdatedEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateEntryUpdatedEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateEntryUpdatedEvent instance.
   *
   * @param args - Initialization arguments containing the storage item details
   */
  constructor(args: StateEntryUpdatedEventInit<T>) {
    super(StateEntryUpdatedEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onState.updated': StateEntryUpdatedEvent;
  }
}
