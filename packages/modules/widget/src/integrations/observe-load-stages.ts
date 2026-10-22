import type { Observable, Subscription } from 'rxjs';
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

/**
 * Maps a store's `<type>::request`, `<type>::success`, `<type>::failure` and `<type>::abort` actions to
 * one terminal record per attempted load stage. Only action types and a classified error
 * `type` are read; manifests, configuration, settings and script modules are never inspected.
 * @param action$ - Existing store action stream; observing it does not trigger any work.
 * @param telemetry - Scope that times and records attempts.
 * @param options - Stage mapping and identity.
 * @returns The owned subscription; unsubscribe it when the owning scope is disposed.
 */
export function observeLoadStages(
  action$: Observable<{ type: string; payload?: unknown }>,
  telemetry: OperationalTelemetry,
  options: LoadStageOptions,
): Subscription {
  const { stages, identity } = options;
  // The store flows use switchMap, so each stage has at most one live attempt.
  const pending = new Map<string, EndOperation>();
  const subscription = action$.subscribe((action) => {
    const [base, phase] = action.type.split('::');
    const operation = stages[base];
    // Synchronous setters and unrelated actions are not load stages.
    if (!operation) {
      return;
    }
    const previous = pending.get(base);
    pending.delete(base);
    // A request starts a new attempt; every other phase ends the pending one.
    if (phase === 'request') {
      // A new request supersedes, and so cancels, the attempt still pending.
      previous?.('cancelled', { ...identity(), reason: 'superseded' });
      pending.set(base, telemetry.start(operation));
      return;
    }
    // Terminal actions without an observed request, e.g. replayed state, are not attempts.
    if (!previous) {
      return;
    }
    // Identity is read at the end, so a version learned during loading is included.
    if (phase === 'success') {
      previous('success', identity());
    } else if (phase === 'failure') {
      previous('failure', { ...identity(), reason: reasonOf(action.payload) });
    } else if (phase === 'abort') {
      previous('cancelled', { ...identity(), reason: 'aborted' });
    } else {
      // Unknown phases leave the attempt pending rather than inventing an outcome.
      pending.set(base, previous);
    }
  });
  subscription.add(() => pending.clear());
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
