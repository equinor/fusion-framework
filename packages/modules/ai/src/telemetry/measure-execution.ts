import { Observable } from 'rxjs';
import { IterableReadableStream } from '@langchain/core/utils/stream';
import type { OperationalOutcome } from '@equinor/fusion-framework-module-telemetry/schemas';
import type { AiOperation, AiReport } from './create-ai-reporter.js';

/**
 * Shape of an instrumented method's result, which decides where the execution ends:
 * - `promise`: settlement of the returned promise;
 * - `observable`: completion, error or unsubscription of each subscription;
 * - `stream`: end, error or cancellation of the resolved LangChain stream;
 * - `generator`: end, error or early return of the async generator.
 */
export type ExecutionKind = 'promise' | 'observable' | 'stream' | 'generator';

/** Cancellation is an expected terminal outcome, not a failure. */
const classify = (error: unknown, signal: AbortSignal | undefined): OperationalOutcome =>
  signal?.aborted || (error instanceof Error && error.name === 'AbortError')
    ? 'cancelled'
    : 'failure';

/**
 * Measures one AI execution from its start until its terminal outcome, exactly once.
 *
 * The original result, values, errors and cancellation are passed through unchanged; only
 * the outcome and elapsed milliseconds are reported. No per-chunk records are produced and
 * time-to-first-result is intentionally not measured.
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
  // Observables and generators are lazy: each subscription or iteration is one execution.
  if (kind === 'observable') {
    return observeObservable(run() as Observable<unknown>, operation, report, signal);
  }
  // Generator results are wrapped the same way as observables, timing from first iteration.
  if (kind === 'generator') {
    return observeGenerator(run() as AsyncGenerator<unknown>, operation, report, signal);
  }
  const started = performance.now();
  let settled = false;
  const finish = (outcome: OperationalOutcome): void => {
    // A terminal outcome is recorded once, even if a stream both errors and is cancelled.
    if (!settled) {
      settled = true;
      report(operation, outcome, performance.now() - started);
    }
  };
  let result: unknown;
  try {
    result = run();
  } catch (error) {
    finish(classify(error, signal));
    throw error;
  }
  return Promise.resolve(result).then(
    (value) => {
      // A resolved stream is only the start of the execution; its consumption ends it.
      if (kind === 'stream') {
        return observeStream(value as AsyncIterable<unknown>, finish, signal);
      }
      finish('success');
      return value;
    },
    (error: unknown) => {
      finish(classify(error, signal));
      throw error;
    },
  );
}

function observeObservable(
  source: Observable<unknown>,
  operation: AiOperation,
  report: AiReport,
  signal: AbortSignal | undefined,
): Observable<unknown> {
  return new Observable((subscriber) => {
    const started = performance.now();
    let settled = false;
    const finish = (outcome: OperationalOutcome): void => {
      // Each subscription reports exactly one terminal outcome.
      if (!settled) {
        settled = true;
        report(operation, outcome, performance.now() - started);
      }
    };
    const subscription = source.subscribe({
      next: (value) => subscriber.next(value),
      error: (error: unknown) => {
        finish(classify(error, signal));
        subscriber.error(error);
      },
      complete: () => {
        finish('success');
        subscriber.complete();
      },
    });
    return () => {
      subscription.unsubscribe();
      // Unsubscribing before a terminal notification is the consumer cancelling the stream.
      finish('cancelled');
    };
  });
}

async function* observeGenerator(
  source: AsyncGenerator<unknown>,
  operation: AiOperation,
  report: AiReport,
  signal: AbortSignal | undefined,
): AsyncGenerator<unknown> {
  // Timing starts with iteration, because creating a generator executes nothing.
  const started = performance.now();
  let outcome: OperationalOutcome = 'cancelled';
  try {
    yield* source;
    outcome = 'success';
  } catch (error) {
    outcome = classify(error, signal);
    throw error;
  } finally {
    // An early `return()` from the consumer leaves the outcome as cancelled.
    report(operation, outcome, performance.now() - started);
  }
}

function observeStream(
  source: AsyncIterable<unknown>,
  finish: (outcome: OperationalOutcome) => void,
  signal: AbortSignal | undefined,
): IterableReadableStream<unknown> {
  const iterator = source[Symbol.asyncIterator]();
  // Same stream type as LangChain returns, so readers, piping and `for await` keep working.
  return new IterableReadableStream<unknown>({
    async pull(controller) {
      try {
        const { value, done } = await iterator.next();
        // Exhausting the source is the successful end of the stream.
        if (done) {
          finish('success');
          controller.close();
          return;
        }
        controller.enqueue(value);
      } catch (error) {
        finish(classify(error, signal));
        controller.error(error);
      }
    },
    async cancel(reason) {
      finish('cancelled');
      await iterator.return?.(reason);
    },
  });
}
