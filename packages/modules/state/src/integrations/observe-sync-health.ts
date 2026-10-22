import type { Observable, Subscription } from 'rxjs';
import type { OperationalTelemetry } from './OperationalTelemetry.js';

/** Static sync statuses and error types that are safe to export as labels. */
const statuses = new Set(['active', 'paused', 'unknown']);
const errorTypes = new Set(['error', 'denied']);

/** Minimal projection of storage events; values, documents and ids are never read. */
interface StorageEvent {
  type: string;
  detail?: unknown;
}

/** Aggregated synchronization activity since the last summary. */
interface SyncActivity {
  changes: number;
  polls: number;
  skippedPolls: number;
  completions: number;
  errors: number;
}

const emptyActivity = (): SyncActivity => ({
  changes: 0,
  polls: 0,
  skippedPolls: 0,
  completions: 0,
  errors: 0,
});

const field = (detail: unknown, key: string): unknown =>
  detail && typeof detail === 'object' ? (detail as Record<string, unknown>)[key] : undefined;

/**
 * Summarizes state synchronization health without exporting stored values or arguments.
 *
 * - A status change (`active`, `paused`, `unknown`) emits one `fusion.state.sync-status`
 *   notification, preceded by a `fusion.state.sync-activity` summary of the counts gathered
 *   since the previous status.
 * - The first error of each type (`error`, `denied`) per status period emits one
 *   `fusion.state.sync-error` notification; repeats are only counted.
 * - Change, poll and completion events are only counted, so polling never emits per event.
 *
 * @param events$ - The storage's existing event stream; observing it starts no work.
 * @param telemetry - Scope that delivers the notifications.
 * @returns The owned subscription; unsubscribing emits a final summary of pending counts.
 */
export function observeSyncHealth(
  events$: Observable<StorageEvent>,
  telemetry: OperationalTelemetry,
): Subscription {
  let activity = emptyActivity();
  let status: string | undefined;
  let reportedErrors = new Set<string>();

  const flush = (): void => {
    // Any non-zero counter means the period had activity worth summarizing.
    const hadActivity = Object.values(activity).some((count) => count > 0);
    // Quiet periods produce no summary at all.
    if (hadActivity) {
      telemetry.notify('sync-activity', 'success', { ...activity });
    }
    activity = emptyActivity();
    reportedErrors = new Set();
  };

  const subscription = events$.subscribe((event) => {
    // Only synchronization events are summarized; state changes and operations are ignored.
    switch (event.type) {
      case 'onStateSync.status': {
        const next = field(event.detail, 'status');
        const value = typeof next === 'string' && statuses.has(next) ? next : 'unknown';
        // Repeated identical statuses are not transitions.
        if (value !== status) {
          flush();
          status = value;
          telemetry.notify('sync-status', 'success', { status: value });
        }
        return;
      }
      case 'onStateSync.error': {
        activity.errors++;
        const type = field(event.detail, 'type');
        const value = typeof type === 'string' && errorTypes.has(type) ? type : 'error';
        // Offline polling repeats the same error; report it once per status period.
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
  // The last period's counts are reported before teardown, then nothing more.
  subscription.add(flush);
  return subscription;
}
