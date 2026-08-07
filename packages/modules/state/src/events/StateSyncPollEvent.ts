/**
 * @fileoverview State sync poll event implementation
 */

import { FrameworkEvent, type FrameworkEventInit } from '@equinor/fusion-framework-module-event';

/** What triggered a one-shot pull under `PouchDbSyncStorage`'s non-`'live'` pull modes. */
export type StateSyncPollTrigger = 'initial' | 'interval' | 'focus';

/**
 * Initialization parameters for sync poll events.
 */
export type StateSyncPollEventInit = FrameworkEventInit<{
  /** Unique identifier for the sync event */
  id?: string;
  /** What triggered this poll: the initial pull, the recurring timer, or tab/window focus */
  trigger: StateSyncPollTrigger;
  /** True when a pull was already in flight and this trigger was dropped instead of overlapping */
  skipped: boolean;
}>;

/**
 * Event dispatched every time `PouchDbSyncStorage` polls for remote changes in a non-`'live'`
 * pull mode - on the initial pull, each `intervalMs` timer tick, and whenever the tab regains
 * visibility. Unlike `onStateSync.status`, this fires even when the
 * poll finds nothing new to pull, so a monitor can confirm scheduled polling is actually running.
 *
 * @example
 * ```typescript
 * eventBus.on('onStateSync.poll', (event) => {
 *   if (event instanceof StateSyncPollEvent) {
 *     console.log('Polled for changes:', event.detail.trigger, event.detail.skipped);
 *   }
 * });
 * ```
 */
export class StateSyncPollEvent extends FrameworkEvent<StateSyncPollEventInit> {
  static readonly Type = 'onStateSync.poll' as const;

  /**
   * Determines whether an unknown value is a state synchronization poll event.
   * @param event - Value to inspect.
   * @returns Whether the value is a state synchronization poll event.
   */
  static is(event: unknown): event is StateSyncPollEvent {
    // Accept actual event instances before checking structurally compatible values.
    if (event instanceof StateSyncPollEvent) {
      return true;
    }
    // Support events crossing package or serialization boundaries.
    if (typeof event === 'object' && event !== null) {
      const eventObj = event as Record<PropertyKey, unknown>;
      return eventObj.type === StateSyncPollEvent.Type && 'detail' in eventObj;
    }
    return false;
  }

  /**
   * Creates a new StateSyncPollEvent instance.
   *
   * @param args - Initialization arguments describing the poll trigger and outcome
   */
  constructor(args: StateSyncPollEventInit) {
    super(StateSyncPollEvent.Type, args);
  }
}

declare module '@equinor/fusion-framework-module-event' {
  interface FrameworkEventMap {
    'onStateSync.poll': StateSyncPollEvent;
  }
}
