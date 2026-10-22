import { type Observable, Subscription } from 'rxjs';
import type {
  OperationalProperties,
  EndOperation,
  OperationalTelemetry,
} from './OperationalTelemetry.js';

/** Static error classifications that are safe to export as a reason code. */
const reasons: Record<string, string> = {
  not_found: 'not-found',
  unauthorized: 'unauthorized',
  deleted: 'deleted',
  unknown: 'unknown',
};

/** Options describing how request, success, failure and abort actions map to stages. */
export interface LoadStageOptions {
  /** Async action base type mapped to its static operation label, e.g. `fetch_manifest`. */
  stages: Readonly<Record<string, string>>;
  /** Static identity resolved when an attempt ends, e.g. the app key and loaded version. */
  identity: () => OperationalProperties;
}

interface LoadStageAction {
  type: string;
  payload?: unknown;
  meta?: object;
}

/**
 * Maps a store's `<type>::request`, `<type>::success`, `<type>::failure` and `<type>::abort` actions to
 * one terminal record per attempted load stage. Only action types and a classified error
 * `type` are read; manifests, configuration, settings and script modules are never inspected.
 * @param action$ - Existing store action stream; observing it does not trigger any work.
 * @param telemetry - Scope that times and records attempts.
 * @param options - Stage mapping and identity.
 * @param flowActions$ - Flow outputs observed before FlowSubject schedules their delivery.
 * @returns The owned subscription; unsubscribe it when the owning scope is disposed.
 */
export function observeLoadStages(
  action$: Observable<LoadStageAction>,
  telemetry: OperationalTelemetry,
  options: LoadStageOptions,
  flowActions$?: Observable<LoadStageAction>,
): Subscription {
  const { stages, identity } = options;
  // Keep in-flight operations keyed by their originating request, not just their stage.
  const pending = new Map<number, { base: string; end: EndOperation; queued: boolean }>();
  const current = new Map<string, number>();
  const subscription = new Subscription();
  /** Starts requests once and correlates delivered terminal actions with their timers. */
  const onAction = (action: LoadStageAction): void => {
    const [base, phase] = action.type.split('::');
    const operation = stages[base];
    // Synchronous setters and unrelated actions are not load stages.
    if (!operation) {
      return;
    }
    // Start only real requests; setters do not create new timers.
    if (phase === 'request') {
      const attemptId =
        action.meta && 'telemetryAttemptId' in action.meta
          ? action.meta.telemetryAttemptId
          : undefined;
      // Requests created by the store always carry an id so a late outcome cannot end a newer attempt.
      if (typeof attemptId !== 'number') {
        return;
      }
      // Requests are observed before the flow runs and again on the public action stream.
      if (pending.has(attemptId)) {
        return;
      }
      const previousId = current.get(base);
      const previous = previousId === undefined ? undefined : pending.get(previousId);
      // Only unfinished inner work is superseded; queued outcomes retain their original request.
      if (previous && previousId !== undefined && !previous.queued) {
        pending.delete(previousId);
        previous.end('cancelled', { ...identity(), reason: 'superseded' });
      }
      const end = telemetry.reserve(operation);
      // Saturation and absent telemetry must not retain diagnostic observers.
      if (!end) {
        current.delete(base);
        return;
      }
      pending.set(attemptId, { base, end, queued: false });
      current.set(base, attemptId);
      return;
    }
    const attemptId =
      action.meta && 'telemetryAttemptId' in action.meta
        ? action.meta.telemetryAttemptId
        : undefined;
    // Uncorrelated external actions cannot complete an observed request.
    if (typeof attemptId !== 'number') {
      return;
    }
    const attempt = pending.get(attemptId);
    // Terminal actions without an observed request, e.g. replayed state, are not attempts.
    if (!attempt || attempt.base !== base || !['success', 'failure', 'abort'].includes(phase)) {
      return;
    }
    // The action id binds outcomes to their request even when FlowSubject delivers them later.
    pending.delete(attemptId);
    // An older queued outcome must not clear the latest attempt's supersession pointer.
    if (current.get(base) === attemptId) {
      current.delete(base);
    }
    // Only the actual terminal phase determines the originating request's outcome.
    if (phase === 'success') {
      attempt.end('success', identity());
    } else if (phase === 'failure') {
      attempt.end('failure', { ...identity(), reason: reasonOf(action.payload) });
    } else {
      attempt.end('cancelled', { ...identity(), reason: 'aborted' });
    }
  };
  // An emitted outcome is already terminal even while FlowSubject still queues its delivery.
  subscription.add(
    flowActions$?.subscribe((action) => {
      const [, phase] = action.type.split('::');
      // Capture request start before a synchronous flow can produce its outcome.
      if (phase === 'request') {
        onAction(action);
        return;
      }
      const id =
        action.meta && 'telemetryAttemptId' in action.meta
          ? action.meta.telemetryAttemptId
          : undefined;
      // Only emitted terminal actions protect work from subsequent supersession.
      if (typeof id === 'number' && ['success', 'failure', 'abort'].includes(phase)) {
        const attempt = pending.get(id);
        // Untracked requests, including capacity overflow, hold no diagnostic state.
        if (attempt) {
          attempt.queued = true;
        }
      }
    }),
  );
  subscription.add(action$.subscribe(onAction));
  subscription.add(() => {
    pending.clear();
    current.clear();
  });
  return subscription;
}

/**
 * Reads only a classified error `type`, never the message, cause or stack.
 * @param error - Failure payload from the store.
 * @returns A static reason code.
 */
function reasonOf(error: unknown): string {
  const type =
    error && typeof error === 'object' && 'type' in error ? (error as { type: unknown }).type : '';
  return (typeof type === 'string' && reasons[type]) || 'error';
}
