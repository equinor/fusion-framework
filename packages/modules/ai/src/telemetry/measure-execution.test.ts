import { describe, expect, it, vi } from 'vitest';
import { lastValueFrom, from, type Observable, take } from 'rxjs';

import type { AiReport } from './create-ai-reporter.js';
import { measureExecution } from './measure-execution.js';

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/** Mimics the built-in Azure clients: the request starts before the observable is returned. */
const eagerRequest = (ms: number): Observable<number[][]> => from(sleep(ms).then(() => [[0.42]]));

describe('observable execution measurement', () => {
  it('times an eager request from the call, not from a delayed subscription', async () => {
    const report = vi.fn<AiReport>();
    const result = measureExecution('observable', 'embed', report, undefined, () =>
      eagerRequest(30),
    ) as Observable<number[][]>;

    await sleep(30);
    await expect(lastValueFrom(result)).resolves.toEqual([[0.42]]);

    expect(report).toHaveBeenCalledTimes(1);
    const [operation, outcome, duration] = report.mock.calls[0];
    expect({ operation, outcome }).toEqual({ operation: 'embed', outcome: 'success' });
    expect(duration).toBeGreaterThanOrEqual(25);
  });

  it('records one execution however often the result is subscribed', async () => {
    const report = vi.fn<AiReport>();
    const result = measureExecution('observable', 'search', report, undefined, () =>
      eagerRequest(1),
    ) as Observable<number[][]>;

    await lastValueFrom(result);
    await lastValueFrom(result);

    expect(report).toHaveBeenCalledTimes(1);
  });

  it('stops a synchronous source on downstream take(1) and records cancellation', () => {
    const report = vi.fn<AiReport>();
    let pulled = 0;
    // Counts how far a synchronous source runs after the consumer has what it needs.
    function* chunks(): Generator<string> {
      // Yield far more chunks than the consumer takes.
      for (let index = 0; index < 100; index++) {
        pulled++;
        yield `chunk-${index}`;
      }
    }
    const received: unknown[] = [];

    const result = measureExecution('observable', 'model-stream', report, undefined, () =>
      from(chunks()),
    ) as Observable<string>;
    // The consumer needs only the first chunk.
    result.pipe(take(1)).subscribe((chunk) => received.push(chunk));

    expect(received).toEqual(['chunk-0']);
    expect(pulled).toBe(1);
    // Check the terminal outcome without reading or asserting on emitted chunk values.
    const outcomes = report.mock.calls.map(([, outcome]) => outcome);
    expect(outcomes).toEqual(['cancelled']);
  });

  it('keeps generator transforms pull-based and forwards early return', async () => {
    const report = vi.fn<AiReport>();
    let pulled = 0;
    async function* chunks(): AsyncGenerator<string> {
      // Yield more chunks than the consumer requests.
      for (let index = 0; index < 100; index++) {
        pulled++;
        yield `chunk-${index}`;
      }
    }

    const generator = measureExecution('generator', 'model-stream', report, undefined, () =>
      chunks(),
    ) as AsyncGenerator<string>;
    const iterator = generator[Symbol.asyncIterator]();

    await expect(iterator.next()).resolves.toEqual({ value: 'chunk-0', done: false });
    await expect(iterator.return?.()).resolves.toEqual({ value: undefined, done: true });

    expect(pulled).toBe(1);
    // Assert only terminal outcomes, never the chunks passed through the observer.
    const outcomes = report.mock.calls.map(([, outcome]) => outcome);
    expect(outcomes).toEqual(['cancelled']);
  });
});
