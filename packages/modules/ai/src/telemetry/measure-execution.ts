import {
  defer,
  lastValueFrom,
  type MonoTypeOperatorFunction,
  type Observable,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import type { AiOperation, AiReport } from './types.js';

/**
 * Shape of an instrumented method's result, which decides where the execution ends:
 * - `promise`: settlement of the returned promise;
 * - `observable`: completion, error or unsubscription of the first subscription;
 * - `stream`: end, error or cancellation of the resolved LangChain stream;
 * - `generator`: end, error or early return of the async generator.
 */
export type ExecutionKind = 'promise' | 'observable' | 'stream' | 'generator';

/** Records one terminal outcome; later calls are ignored. */
type RecordOutcome = (outcome: OperationalOutcome) => void;

/** Cancellation is an expected terminal outcome, not a failure. */
const classify = (error: unknown, signal: AbortSignal | undefined): OperationalOutcome =>
  signal?.aborted || (error instanceof Error && error.name === 'AbortError')
    ? 'cancelled'
    : 'failure';

/**
 * Starts timing one execution and returns its recorder.
 *
 * @param operation - Static operation label.
 * @param report - Isolated outcome reporter.
 * @returns A recorder reporting the first outcome with the time elapsed since this call.
 */
function startExecution(operation: AiOperation, report: AiReport): RecordOutcome {
  const started = performance.now();
  let recorded = false;
  return (outcome) => {
    // One execution has one terminal outcome, even if it both errors and is cancelled.
    if (!recorded) {
      recorded = true;
      report(operation, outcome, performance.now() - started);
    }
  };
}

/**
 * Records the terminal outcome of an observable without altering its notifications.
 * As an operator, it is chained to the downstream subscriber, so synchronous downstream
 * cancellation such as `take(1)` stops the source and is recorded as `cancelled`.
 *
 * @param record - Recorder of the execution.
 * @param signal - Caller abort signal, used only to classify cancellation.
 * @returns An operator passing all notifications through.
 */
const recordTerminal = (
  record: RecordOutcome,
  signal: AbortSignal | undefined,
): MonoTypeOperatorFunction<unknown> =>
  tap({
    complete: () => record('success'),
    error: (error: unknown) => record(classify(error, signal)),
    // Unsubscribing before a terminal notification is the consumer cancelling the execution.
    unsubscribe: () => record('cancelled'),
  });

/**
 * Measures one AI execution from its start until its terminal outcome, exactly once.
 *
 * The original result, values, errors and cancellation are passed through unchanged; only
 * the outcome and elapsed milliseconds are reported. No per-chunk records are produced and
 * time-to-first-result is intentionally not measured.
 *
 * An `invoke$` call is one execution timed from the call, because clients may start their
 * request before returning the observable (the built-in Azure clients do). Its first
 * subscription ends the record; resubscribing produces no further records.
 *
 * @param kind - How the execution ends, see {@link ExecutionKind}.
 * @param operation - Static operation label.
 * @param report - Isolated outcome reporter.
 * @param signal - Caller abort signal, used only to classify cancellation.
 * @param run - Starts the original execution.
 * @returns The original result, or an equivalent observing wrapper.
 * @throws Rethrows any synchronous error from `run` unchanged.
 */
export function measureExecution(
  kind: ExecutionKind,
  operation: AiOperation,
  report: AiReport,
  signal: AbortSignal | undefined,
  run: () => unknown,
): unknown {
  // An async generator executes nothing until iterated, so it times itself from the first pull.
  if (kind === 'generator') {
    return observeGenerator(run() as AsyncGenerator<unknown>, operation, report, signal);
  }
  const record = startExecution(operation, report);
  let result: unknown;
  try {
    result = run();
  } catch (error) {
    record(classify(error, signal));
    throw error;
  }
  // Observable results end with their first subscription's terminal notification.
  if (kind === 'observable') {
    // Chain the recorder so it observes exactly what the downstream subscriber observes.
    return (result as Observable<unknown>).pipe(recordTerminal(record, signal));
  }
  return Promise.resolve(result).then(
    (value) => {
      // A resolved stream is only the start of the execution; its consumption ends it.
      if (kind === 'stream') {
        return observeStream(value as AsyncIterable<unknown>, record, signal);
      }
      record('success');
      return value;
    },
    (error: unknown) => {
      record(classify(error, signal));
      throw error;
    },
  );
}

/**
 * Measures a LangChain `transform` generator while keeping it pull-based.
 *
 * LangChain chains consume `transform` as an `AsyncGenerator`, so this returns one.
 * Each step is delegated to the source unchanged and observed through RxJS; nothing is
 * prefetched or buffered. Timing starts at the first pull, because a generator does no
 * work until it is iterated.
 *
 * @param source - Generator returned by the original client.
 * @param operation - Static operation label.
 * @param report - Isolated outcome reporter.
 * @param signal - Caller abort signal, used only to classify cancellation.
 * @returns A generator yielding the same chunks.
 */
function observeGenerator(
  source: AsyncGenerator<unknown>,
  operation: AiOperation,
  report: AiReport,
  signal: AbortSignal | undefined,
): AsyncGenerator<unknown> {
  // Start timing at the first pull and reuse that one recorder for every later step.
  const recorder$ = defer(() => of(startExecution(operation, report))).pipe(shareReplay(1));

  const step = (
    run: () => Promise<IteratorResult<unknown>>,
    outcomeWhenDone: OperationalOutcome,
  ): Promise<IteratorResult<unknown>> => {
    // Run one generator step; record an outcome only when the source ends or fails.
    const step$ = recorder$.pipe(
      switchMap((record) =>
        defer(run)
          // Observe the step without changing its result or error.
          .pipe(
            tap({
              next: (result) => {
                // Ordinary chunks are not recorded; only the final step ends the execution.
                if (result.done) record(outcomeWhenDone);
              },
              error: (error: unknown) => record(classify(error, signal)),
            }),
          ),
      ),
    );
    return lastValueFrom(step$);
  };

  const generator: AsyncGenerator<unknown> = {
    next: (value?: unknown) => step(() => source.next(value), 'success'),
    return: (value?: unknown) => step(() => source.return(value), 'cancelled'),
    throw: (error?: unknown) => step(() => source.throw(error), 'success'),
    [Symbol.asyncIterator]: () => generator,
    [Symbol.asyncDispose]: async () => {
      await generator.return(undefined);
    },
  };
  return generator;
}

/**
 * Re-exposes a LangChain stream while recording when its consumption ends.
 *
 * @param source - Stream resolved by the original client.
 * @param record - Recorder of the execution.
 * @param signal - Caller abort signal, used only to classify cancellation.
 * @returns A stream of the same type, so readers, piping and `for await` keep working.
 */
function observeStream(
  source: AsyncIterable<unknown>,
  record: RecordOutcome,
  signal: AbortSignal | undefined,
): IterableReadableStream<unknown> {
  const iterator = source[Symbol.asyncIterator]();
  return new IterableReadableStream<unknown>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        // Exhausting the source is the successful end of the stream.
        if (done) {
          record('success');
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        record(classify(error, signal));
        controller.error(error);
      }
    },
    async cancel(reason) {
      record('cancelled');
      await iterator.return?.(reason);
    },
  });
}
