/**
 * @fileoverview State event exports and type definitions.
 * This module provides a centralized export point for all state-related events.
 */
import { StateEntryCreatedEvent } from './StateEntryCreatedEvent.js';
import { StateEntryDeletedEvent } from './StateEntryDeletedEvent.js';
import { StateEntryUpdatedEvent } from './StateEntryUpdatedEvent.js';
import { StateOperationFailureEvent } from './StateOperationFailureEvent.js';
import { StateOperationSuccessEvent } from './StateOperationSuccessEvent.js';
import { StateSyncChangeEvent } from './StateSyncChangeEvent.js';
import { StateSyncCompleteEvent } from './StateSyncCompleteEvent.js';
import { StateSyncErrorEvent } from './StateSyncErrorEvent.js';
import { StateSyncStatusEvent } from './StateSyncStatusEvent.js';
import type { StateErrorEvent } from './StateErrorEvent.js';

import type { AllowedValue } from '../types.js';

// Export state error events
export { StateErrorEvent } from './StateErrorEvent.js';

/**
 * Union type representing all possible state change events.
 * This type can be used for event handling when you need to handle any state change event.
 */
export const StateChangeEvent = {
  Created: StateEntryCreatedEvent,
  Updated: StateEntryUpdatedEvent,
  Deleted: StateEntryDeletedEvent,
  is: (
    event: unknown,
  ): event is StateEntryCreatedEvent | StateEntryUpdatedEvent | StateEntryDeletedEvent => {
    return (
      StateEntryCreatedEvent.is(event) ||
      StateEntryUpdatedEvent.is(event) ||
      StateEntryDeletedEvent.is(event)
    );
  },
} as const;

export type StateChangeEventType<T extends AllowedValue = AllowedValue> =
  | StateEntryCreatedEvent<T>
  | StateEntryUpdatedEvent<T>
  | StateEntryDeletedEvent<T>;

/**
 * Union type representing all possible state sync events.
 * This type can be used for event handling when you need to handle any state sync event.
 */
export const StateSyncEvent = {
  Change: StateSyncChangeEvent,
  Complete: StateSyncCompleteEvent,
  Error: StateSyncErrorEvent,
  Status: StateSyncStatusEvent,
  is: (
    event: unknown,
  ): event is
    | StateSyncChangeEvent
    | StateSyncCompleteEvent
    | StateSyncErrorEvent
    | StateSyncStatusEvent => {
    return (
      StateSyncChangeEvent.is(event) ||
      StateSyncCompleteEvent.is(event) ||
      StateSyncErrorEvent.is(event) ||
      StateSyncStatusEvent.is(event)
    );
  },
} as const;

export type StateSyncEventType<T extends AllowedValue = AllowedValue> =
  | StateSyncChangeEvent<T>
  | StateSyncCompleteEvent<T>
  | StateSyncErrorEvent
  | StateSyncStatusEvent
  | StateErrorEvent;

/**
 * Union type representing all possible state operation events.
 * This type can be used for event handling when you need to handle any state operation event.
 */
export const StateOperationEvent = {
  Success: StateOperationSuccessEvent,
  Failure: StateOperationFailureEvent,
  is: (event: unknown): event is StateOperationSuccessEvent | StateOperationFailureEvent => {
    return StateOperationSuccessEvent.is(event) || StateOperationFailureEvent.is(event);
  },
} as const;

export type StateOperationEventType = StateOperationSuccessEvent | StateOperationFailureEvent;

export type StateEventType<T extends AllowedValue = AllowedValue> =
  | StateChangeEventType<T>
  | StateSyncEventType<T>
  | StateOperationEventType
  | StateErrorEvent;
