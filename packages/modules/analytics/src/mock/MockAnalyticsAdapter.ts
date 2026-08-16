import { Subject, filter, type Subscription } from 'rxjs';

import type { IAnalyticsAdapter } from '../adapters/AnalyticsAdapter.interface.js';
import type { AnalyticsEvent } from '../types.js';

/**
 * Selects which recorded events {@link MockAnalyticsAdapter.waitForAnalytic} or
 * {@link MockAnalyticsAdapter.getAnalytics} act on.
 *
 * - `string` — matches `event.name` exactly.
 * - `string[]` — matches if `event.name` is any of the given entries.
 * - `(event) => boolean` — arbitrary predicate over the full event.
 */
export type AnalyticsEventMatcher<T extends AnalyticsEvent = AnalyticsEvent> =
  | string
  | string[]
  | ((event: T) => boolean);

/** Options accepted by {@link MockAnalyticsAdapter.waitForAnalytic}. */
export interface WaitForAnalyticOptions {
  /**
   * Maximum time in milliseconds to wait for a matching event.
   * When elapsed the returned promise rejects.
   */
  timeout?: number;
  /**
   * AbortSignal that can cancel the wait early.
   * When aborted the returned promise rejects with the signal's reason.
   */
  signal?: AbortSignal;
}

/**
 * An {@link IAnalyticsAdapter} that records every tracked event in-memory instead
 * of exporting it to a backend, for asserting on analytics in tests.
 *
 * @remarks
 * Register it like any other adapter via {@link IAnalyticsConfigurator.setAdapter};
 * it does not interfere with other adapters registered alongside it.
 *
 * @template T - Analytics event type, defaults to {@link AnalyticsEvent}.
 *
 * @example
 * ```ts
 * import { MockAnalyticsAdapter } from '@equinor/fusion-framework-module-analytics/mock';
 *
 * const recorder = new MockAnalyticsAdapter();
 * enableAnalytics(configurator, (builder) => {
 *   builder.setAdapter('mock', async () => recorder);
 * });
 *
 * // ...later, in a test
 * const event = await recorder.waitForAnalytic('button-click');
 * expect(event.attributes?.section).toBe('header');
 * ```
 */
export class MockAnalyticsAdapter<T extends AnalyticsEvent = AnalyticsEvent>
  implements IAnalyticsAdapter<T>
{
  #events: T[] = [];
  #events$ = new Subject<T>();

  /**
   * Records the event so it is visible to {@link getAnalytics} and any pending
   * {@link waitForAnalytic} calls.
   *
   * @param event - The analytics event to record.
   */
  registerAnalytic(event: T): void {
    this.#events.push(event);
    this.#events$.next(event);
  }

  /**
   * Returns recorded events matching `matcher`, in dispatch order.
   *
   * @param matcher - Event name, array of names, or a predicate. Omit to get every recorded event.
   * @returns Matching recorded events.
   */
  getAnalytics(matcher?: AnalyticsEventMatcher<T>): T[] {
    // No matcher: return every event recorded so far.
    if (matcher === undefined) return [...this.#events];
    // Narrow down to events accepted by the matcher.
    return this.#events.filter((event) => this.#matches(event, matcher));
  }

  /**
   * Waits for the next event matching `matcher`, resolving immediately if a
   * matching event was already recorded.
   *
   * @param matcher - Event name, array of names, or a predicate.
   * @param options - Optional timeout (ms) or AbortSignal.
   * @returns A promise that resolves with the first matching event.
   */
  waitForAnalytic(matcher: AnalyticsEventMatcher<T>, options?: WaitForAnalyticOptions): Promise<T> {
    // Already recorded: resolve immediately rather than only watching future events.
    const recorded = this.#events.find((event) => this.#matches(event, matcher));
    // Already recorded: resolve immediately rather than only watching future events.
    if (recorded) return Promise.resolve(recorded);

    return new Promise<T>((resolve, reject) => {
      const { timeout: ms, signal } = options ?? {};

      // Fail fast without subscribing when the caller already aborted.
      if (signal?.aborted) {
        reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        return;
      }

      let timer: ReturnType<typeof setTimeout> | undefined;
      // Declared before subscribing so `complete` can reach it even when the
      // adapter is already disposed and fires synchronously during `subscribe`.
      let sub: Subscription | undefined;

      const cleanup = () => {
        clearTimeout(timer);
        sub?.unsubscribe();
      };

      // Only forward events accepted by the matcher to the subscriber below.
      sub = this.#events$.pipe(filter((event) => this.#matches(event, matcher))).subscribe({
        next: (event) => {
          cleanup();
          resolve(event);
        },
        // A throwing predicate matcher surfaces here instead of hanging the promise forever.
        error: (err) => {
          cleanup();
          reject(err);
        },
        complete: () => {
          cleanup();
          reject(new Error('MockAnalyticsAdapter disposed before a matching event was recorded'));
        },
      });

      // Only arm a timeout when the caller opted in.
      if (ms !== undefined) {
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`waitForAnalytic timed out after ${ms}ms`));
        }, ms);
      }

      // Only wire abort handling when the caller passed a signal.
      if (signal) {
        signal.addEventListener(
          'abort',
          () => {
            cleanup();
            reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
          },
          { once: true },
        );
      }
    });
  }

  /**
   * Tests whether `event` satisfies `matcher`.
   *
   * @param event - Event to test.
   * @param matcher - Event name, array of names, or a predicate.
   * @returns Whether `event` matches.
   */
  #matches(event: T, matcher: AnalyticsEventMatcher<T>): boolean {
    // String matcher: compare event name directly.
    if (typeof matcher === 'string') return event.name === matcher;
    // Array matcher: match against any of the given names.
    if (Array.isArray(matcher)) return matcher.includes(event.name);
    return matcher(event);
  }

  /** Completes the internal event stream, rejecting any pending `waitForAnalytic` calls. */
  [Symbol.dispose]() {
    this.#events$.complete();
  }
}
