/**
 * @fileoverview State sync status event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

import type { AllowedValue } from '../types.js';
import type { StateSyncStatus } from '../storage/types.js';

/**
 * Initialization parameters for sync status events.
 *
 * @template T - The type of data being synced
 */
export type StateSyncStatusEventInit = FrameworkEventInit<{
  /** Unique identifier for the sync session */
  id?: string;
  /** Status of the sync operation */
  status: StateSyncStatus;
}>;

/**
 * Event dispatched when the sync operation status changes (e.g., becomes active or paused).
 *
 * @template T - The type of data being synced
 *
 * @example
 * ```typescript
 * eventBus.on('onStateSync.status', (event) => {
 *   if (event instanceof StateSyncStatusEvent) {
 *     console.log('Sync status changed:', event.status, event.id);
 *   }
 * });
 * ```
 */
export class StateSyncStatusEvent<
  T extends AllowedValue = AllowedValue,
> extends FrameworkEvent<StateSyncStatusEventInit> {
  static readonly Type = 'onStateSync.status';
  static is(event: unknown): event is StateSyncStatusEvent {
    if (event instanceof StateSyncStatusEvent) {
      return true;
    }
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateSyncStatusEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateSyncStatusEvent instance.
   *
   * @param args - Initialization arguments containing event details
   */
  constructor(args: StateSyncStatusEventInit) {
    super(StateSyncStatusEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateSync.status': StateSyncStatusEvent;
  }
}
