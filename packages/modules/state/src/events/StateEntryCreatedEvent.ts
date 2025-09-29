/**
 * @fileoverview State entry created event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';
import type { AllowedValue } from '@equinor/fusion-framework-module-state';
import type { StorageItem } from '../storage/types.js';

/**
 * Initialization parameters for state entry created events.
 *
 * @template T - The type of the allowed value stored in the item
 */
export type StateEntryCreatedEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  /** Internal Database ID */
  _id?: string;
  /** User-facing key */
  key: string;
  /** Storage item being created */
  item: StorageItem<T>;
}>;

/**
 * Event dispatched when a new state entry is created.
 *
 * @template T - The type of the allowed value stored in the item
 *
 * @example
 * ```typescript
 * eventBus.on('onState.created', (event) => {
 *   if (event instanceof StateEntryCreatedEvent) {
 *     console.log('Entry created:', event.key, event.item);
 *   }
 * });
 * ```
 */
export class StateEntryCreatedEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateEntryCreatedEventInit<T>
> {
  static readonly Type = 'onState.created';

  static is(event: unknown): event is StateEntryCreatedEvent {
    if (event instanceof StateEntryCreatedEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateEntryCreatedEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateEntryCreatedEvent instance.
   *
   * @param args - Initialization arguments containing the storage item details
   */
  constructor(args: StateEntryCreatedEventInit<T>) {
    super(StateEntryCreatedEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onState.created': StateEntryCreatedEvent;
  }
}
