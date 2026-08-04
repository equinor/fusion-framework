/**
 * @fileoverview State sync change event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { AllowedValue } from '../types.js';

import type { SyncReplicationResult } from '../storage/types.js';

/**
 * Initialization parameters for sync change events.
 *
 * @template T - The type of data being synced
 */
export type StateSyncChangeEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  /** Unique identifier for the sync event */
  id?: string;
  /** Direction of the sync operation */
  direction: 'push' | 'pull';
  /** Details about the replication operation */
  change: SyncReplicationResult<T>;
}>;

/**
 * Event dispatched when data changes are successfully synced between databases.
 *
 * @template T - The type of data being synced
 */
export class StateSyncChangeEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateSyncChangeEventInit<T>
> {
  static readonly Type = 'onStateSync.change' as const;

  /**
   * Determines whether an unknown value is a state synchronization change event.
   * @param event - Value to inspect.
   * @returns Whether the value is a state synchronization change event.
   */
  static is(event: unknown): event is StateSyncChangeEvent {
    // Accept actual event instances before checking structurally compatible values.
    if (event instanceof StateSyncChangeEvent) {
      return true;
    }
    // Support events crossing package or serialization boundaries.
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateSyncChangeEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateSyncChangeEvent instance.
   *
   * @param args - Initialization arguments containing sync result information
   */
  constructor(args: StateSyncChangeEventInit<T>) {
    super(StateSyncChangeEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateSync.change': StateSyncChangeEvent;
  }
}
