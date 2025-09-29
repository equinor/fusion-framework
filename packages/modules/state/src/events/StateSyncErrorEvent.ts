import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

export type StateSyncErrorType = 'error' | 'denied';

/**
 * Initialization parameters for sync error events.
 * Requires error information to be present.
 *
 * @template T - The type of data being synced
 */
export type StateSyncErrorEventInit = FrameworkEventInit<{
  /** Unique identifier for the sync event (optional, auto-generated if not provided) */
  id?: string;
  /** Error information (required for error events) */
  error: unknown;
  type: StateSyncErrorType;
}>;

/**
 * Event fired when an error occurs during sync operation.
 * This could be due to network issues, authentication problems, or
 * other runtime errors during the sync process.
 *
 * @template T - The type of data being synced
 *
 * @example
 * ```typescript
 * // Listen for sync errors
 * eventBus.on('onStateSync.error', (event) => {
 *   if (event instanceof StateSyncErrorEvent) {
 *     console.error('Sync error:', event.error);
 *     // Handle error (retry, show user message, etc.)
 *   }
 * });
 *
 * // Create a sync error event
 * const errorEvent = new StateSyncErrorEvent({
 *   detail: {
 *     error: new Error('Network connection failed'),
 *     id: 'sync-session-456'
 *   }
 * });
 * ```
 */
export class StateSyncErrorEvent extends FrameworkEvent<StateSyncErrorEventInit> {
  static readonly Type = 'onStateSync.error' as const;

  static is(event: unknown): event is StateSyncErrorEvent {
    if (event instanceof StateSyncErrorEvent) {
      return true;
    }

    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateSyncErrorEvent.Type && 'detail' in eventObj;
    }

    return false;
  }

  /**
   * Creates a new StateSyncErrorEvent instance.
   * @param args - Initialization arguments containing error information
   */
  constructor(args: StateSyncErrorEventInit) {
    super(StateSyncErrorEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateSync.error': StateSyncErrorEvent;
  }
}
