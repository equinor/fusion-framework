import {
  catchError,
  defer,
  from,
  lastValueFrom,
  type MonoTypeOperatorFunction,
  type Observable,
  tap,
  throwError,
} from 'rxjs';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import type { AiOperation, AiReport } from './create-ai-reporter.js';

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
 * Observes each pull of an async generator through RxJS while preserving its pull-based contract.
 *
 * LangChain's `transform` contract returns an `AsyncGenerator`, so the adapter must remain
 * pull-based. Each `next`, `return` or `throw` operation is measured with a one-value RxJS
 * pipeline; it does not subscribe ahead, buffer chunks, or alter consumer cancellation.
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
  const iterator = source[Symbol.asyncIterator]();
  let recorder: RecordOutcome | undefined;
  let completed = false;
  const getRecorder = (): RecordOutcome => {
    recorder ??= startExecution(operation, report);
    return recorder;
  };
  const pull = <T>(next: () => PromiseLike<T>, observe: (result: T) => void): Promise<T> => {
    const source$ = defer(() => from(next()));
    // A one-result pipeline observes a pull without prefetching or buffering chunks.
    const result$ = source$.pipe(
      tap(observe),
      catchError((error: unknown) => {
        // Preserve the source error while recording the failed pull once.
        completed = true;
        getRecorder()(classify(error, signal));
        return throwError(() => error);
      }),
    );
    return lastValueFrom(result$);
  };
  const observeNext = (result: IteratorResult<unknown>): void => {
    // Record success only when the source reports natural completion.
    if (result.done) {
      completed = true;
      getRecorder()('success');
    }
  };
  const output: AsyncGenerator<unknown> = {
    next(value?: unknown): Promise<IteratorResult<unknown>> {
      // Do not pull a source again after its terminal result.
      if (completed) {
        return Promise.resolve({ value: undefined, done: true });
      }
      return pull(() => iterator.next(value), observeNext);
    },
    return(value?: unknown): Promise<IteratorResult<unknown>> {
      // Repeated close calls are harmless after the source is terminal.
      if (completed) {
        return Promise.resolve({ value, done: true });
      }
      const close = iterator.return
        ? (): PromiseLike<IteratorResult<unknown>> => iterator.return(value)
        : (): PromiseLike<IteratorResult<unknown>> => Promise.resolve({ value, done: true });
      return pull(close, (result) => {
        // The consumer intentionally stopped before normal exhaustion.
        if (result.done) {
          completed = true;
          getRecorder()('cancelled');
        }
      });
    },
    throw(error?: unknown): Promise<IteratorResult<unknown>> {
      // A completed source cannot accept another injected error.
      if (completed) {
        return Promise.reject(error);
      }
      // Preserve the caller's error when the source has no throw handler.
      if (!iterator.throw) {
        completed = true;
        getRecorder()(classify(error, signal));
        return Promise.reject(error);
      }
      return pull(
        () => iterator.throw?.(error) as PromiseLike<IteratorResult<unknown>>,
        observeNext,
      );
    },
    [Symbol.asyncIterator](): AsyncGenerator<unknown> {
      return output;
    },
    [Symbol.asyncDispose](): Promise<void> {
      return output.return(undefined).then(() => undefined);
    },
  };
  return output;
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
