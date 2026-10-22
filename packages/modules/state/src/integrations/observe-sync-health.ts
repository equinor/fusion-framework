import type { Observable, Subscription } from 'rxjs';
import type { OperationalTelemetry } from './OperationalTelemetry.js';

/** Static sync statuses and error types that are safe to export as labels. */
const statuses = new Set(['active', 'paused', 'unknown']);
const errorTypes = new Set(['error', 'denied']);

/** Default reporting window; polling replicates every few seconds, well inside it. */
const DEFAULT_WINDOW_MS = 60_000;

/** Minimal projection of storage events; values, documents and ids are never read. */
interface StorageEvent {
  type: string;
  detail?: unknown;
}

/** Aggregated synchronization activity within one reporting window. */
interface SyncActivity {
  statusChanges: number;
  changes: number;
  polls: number;
  skippedPolls: number;
  completions: number;
  errors: number;
}

/** Options for {@link observeSyncHealth}. */
export interface SyncHealthOptions {
  /** Length of one reporting window in milliseconds. */
  windowMs?: number;
  /** Clock used to bound windows; defaults to `Date.now`. */
  now?: () => number;
}

const emptyActivity = (): SyncActivity => ({
  statusChanges: 0,
  changes: 0,
  polls: 0,
  skippedPolls: 0,
  completions: 0,
  errors: 0,
});

const field = (detail: unknown, key: string): unknown =>
  detail && typeof detail === 'object' ? (detail as Record<string, unknown>)[key] : undefined;

/**
 * Summarizes state synchronization health in bounded reporting windows, without exporting
 * stored values or arguments.
 *
 * Polling makes each pull report `active` and then `paused`, so status and error churn is
 * bounded per window rather than per transition:
 *
 * - `fusion.state.sync-status` is emitted for the first transition into each status in a
 *   window; repeated transitions are only counted.
 * - `fusion.state.sync-error` is emitted for the first error of each type in a window.
 * - `fusion.state.sync-activity` summarizes the window's counts and the current status. It is
 *   emitted when the next event arrives after the window ends, and on teardown; quiet windows
 *   emit nothing.
 *
 * @param events$ - The storage's existing event stream; observing it starts no work.
 * @param telemetry - Scope that delivers the notifications.
 * @param options - Optional window length and clock.
 * @returns The owned subscription; unsubscribing emits a final summary of pending counts.
 */
export function observeSyncHealth(
  events$: Observable<StorageEvent>,
  telemetry: OperationalTelemetry,
  options?: SyncHealthOptions,
): Subscription {
  const windowMs = options?.windowMs ?? DEFAULT_WINDOW_MS;
  const now = options?.now ?? Date.now;
  let windowStart = now();
  let activity = emptyActivity();
  let status: string | undefined;
  let reportedStatuses = new Set<string>();
  let reportedErrors = new Set<string>();

  const flush = (): void => {
    // Any non-zero counter means the window had activity worth summarizing.
    const hadActivity = Object.values(activity).some((count) => count > 0);
    // Quiet windows produce no summary at all.
    if (hadActivity) {
      // Counts plus the current status; the status is omitted until one is observed.
      telemetry.notify('sync-activity', 'success', {
        ...activity,
        ...(status ? { status } : {}),
      });
    }
    activity = emptyActivity();
    reportedStatuses = new Set();
    reportedErrors = new Set();
    windowStart = now();
  };

  const subscription = events$.subscribe((event) => {
    // A new window starts with the summary of the previous one, so churn stays bounded.
    if (now() - windowStart >= windowMs) {
      flush();
    }
    // Only synchronization events are summarized; state changes and operations are ignored.
    switch (event.type) {
      case 'onStateSync.status': {
        const next = field(event.detail, 'status');
        const value = typeof next === 'string' && statuses.has(next) ? next : 'unknown';
        // Repeated identical statuses are not transitions.
        if (value === status) {
          return;
        }
        status = value;
        activity.statusChanges++;
        // Each status is reported once per window; polling transitions are only counted.
        if (!reportedStatuses.has(value)) {
          reportedStatuses.add(value);
          telemetry.notify('sync-status', 'success', { status: value });
        }
        return;
      }
      case 'onStateSync.error': {
        activity.errors++;
        const type = field(event.detail, 'type');
        const value = typeof type === 'string' && errorTypes.has(type) ? type : 'error';
        // Offline polling repeats the same error; report it once per window.
        if (!reportedErrors.has(value)) {
          reportedErrors.add(value);
          telemetry.notify('sync-error', 'failure', { errorType: value });
        }
        return;
      }
      case 'onStateSync.change':
        activity.changes++;
        return;
      case 'onStateSync.poll':
        // Skipped polls overlap a running pull, so they are counted separately.
        if (field(event.detail, 'skipped') === true) {
          activity.skippedPolls++;
        } else {
          activity.polls++;
        }
        return;
      case 'onStateSync.complete':
        activity.completions++;
        return;
    }
  });
  // The last window's counts are reported before teardown, then nothing more.
  subscription.add(flush);
  return subscription;
}
