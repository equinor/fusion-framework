/**
 * @fileoverview State sync complete event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { AllowedValue } from '../types.js';
import type { SyncReplicationResult } from '../storage/types.js';

export type SyncReplicationSyncResult<T extends AllowedValue = AllowedValue> = {
  push?: SyncReplicationResult<T> & { status?: string };
  pull?: SyncReplicationResult<T> & { status: string };
};

/**
 * Initialization parameters for sync completion events.
 *
 * @template T - The type of data being synced
 */
export type StateSyncCompleteEventInit<T extends AllowedValue = AllowedValue> = FrameworkEventInit<{
  /** Unique identifier for the sync event */
  id?: string;
  result: SyncReplicationSyncResult<T>;
}>;

/**
 * Event dispatched when the entire sync operation completes successfully.
 *
 * @template T - The type of data being synced
 *
 * @example
 * ```typescript
 * eventBus.on('onStateSync.complete', (event) => {
 *   if (event instanceof StateSyncCompleteEvent) {
 *     console.log('Sync completed:', event.id);
 *   }
 * });
 * ```
 */
export class StateSyncCompleteEvent<T extends AllowedValue = AllowedValue> extends FrameworkEvent<
  StateSyncCompleteEventInit<T>
> {
  static readonly Type = 'onStateSync.complete' as const;
  static is(event: unknown): event is StateSyncCompleteEvent {
    if (event instanceof StateSyncCompleteEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateSyncCompleteEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateSyncCompleteEvent instance.
   *
   * @param args - Initialization arguments for the completion event
   */
  constructor(args: StateSyncCompleteEventInit<T>) {
    super(StateSyncCompleteEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateSync.complete': StateSyncCompleteEvent;
  }
}
