import { Subject, filter, type Subscription } from 'rxjs';

import { BaseTelemetryAdapter } from '../TelemetryAdapter.js';
import type { TelemetryItem } from '../types.js';

/**
 * Selects which recorded items {@link MockTelemetryAdapter.waitForItem} or
 * {@link MockTelemetryAdapter.getItems} act on.
 *
 * - `string` — matches `item.name` exactly.
 * - `string[]` — matches if `item.name` is any of the given entries.
 * - `(item) => boolean` — arbitrary predicate over the full item.
 */
export type TelemetryItemMatcher = string | string[] | ((item: TelemetryItem) => boolean);

/** Options accepted by {@link MockTelemetryAdapter.waitForItem}. */
export interface WaitForItemOptions {
  /**
   * Maximum time in milliseconds to wait for a matching item.
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
 * A {@link BaseTelemetryAdapter} that records every processed telemetry item
 * in-memory instead of exporting it to a backend, for asserting on telemetry
 * in tests.
 *
 * @remarks
 * Register it like any other adapter via
 * {@link ITelemetryConfigurator.setAdapter}; it does not interfere with other
 * adapters registered alongside it. {@link TelemetryMockConfigurator} already
 * registers one by default, so most tests reach it through
 * `FrameworkMockConfigurator.telemetry.adapter` rather than constructing this
 * directly.
 *
 * @example
 * ```ts
 * import { MockTelemetryAdapter } from '@equinor/fusion-framework-module-telemetry/mock';
 *
 * const recorder = new MockTelemetryAdapter();
 * enableTelemetry(configurator, (builder) => {
 *   builder.setAdapter('mock', recorder);
 * });
 *
 * // ...later, in a test
 * const item = await recorder.waitForItem('my-metric');
 * expect(item.properties?.section).toBe('header');
 * ```
 */
export class MockTelemetryAdapter extends BaseTelemetryAdapter {
  #items: TelemetryItem[] = [];
  #items$ = new Subject<TelemetryItem>();

  /**
   * Records the item so it is visible to {@link getItems} and any pending
   * {@link waitForItem} calls.
   *
   * @param item - The telemetry item to record.
   */
  protected _processItem(item: TelemetryItem): void {
    this.#items.push(item);
    this.#items$.next(item);
  }

  /**
   * Returns recorded items matching `matcher`, in processing order.
   *
   * @param matcher - Item name, array of names, or a predicate. Omit to get every recorded item.
   * @returns Matching recorded items.
   */
  getItems(matcher?: TelemetryItemMatcher): TelemetryItem[] {
    // No matcher: return every item recorded so far.
    if (matcher === undefined) return [...this.#items];
    // Narrow down to items accepted by the matcher.
    return this.#items.filter((item) => this.#matches(item, matcher));
  }

  /**
   * Waits for the next item matching `matcher`, resolving immediately if a
   * matching item was already recorded.
   *
   * @param matcher - Item name, array of names, or a predicate.
   * @param options - Optional timeout (ms) or AbortSignal.
   * @returns A promise that resolves with the first matching item.
   */
  waitForItem(matcher: TelemetryItemMatcher, options?: WaitForItemOptions): Promise<TelemetryItem> {
    // Check items recorded before this call, so callers don't miss items that already happened.
    const recorded = this.#items.find((item) => this.#matches(item, matcher));
    // Already recorded: resolve immediately rather than only watching future items.
    if (recorded) return Promise.resolve(recorded);

    return new Promise<TelemetryItem>((resolve, reject) => {
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
      // Named so `cleanup` can remove it directly instead of relying only on
      // `{ once: true }`, which only removes it once it has actually fired.
      let onAbort: (() => void) | undefined;

      const cleanup = () => {
        clearTimeout(timer);
        sub?.unsubscribe();
        // Only registered when a signal was passed, and only once even if cleanup runs twice.
        if (onAbort) signal?.removeEventListener('abort', onAbort);
      };

      // Only forward items accepted by the matcher to the subscriber below.
      sub = this.#items$.pipe(filter((item) => this.#matches(item, matcher))).subscribe({
        next: (item) => {
          cleanup();
          resolve(item);
        },
        // A throwing predicate matcher surfaces here instead of hanging the promise forever.
        error: (err) => {
          cleanup();
          reject(err);
        },
        complete: () => {
          cleanup();
          reject(new Error('MockTelemetryAdapter disposed before a matching item was recorded'));
        },
      });

      // An adapter already disposed before this call completes the subscription
      // synchronously above, settling the promise \u2014 arming a timeout or abort
      // listener below would then leak resources tied to an already-settled promise.
      if (sub.closed) return;

      // Only arm a timeout when the caller opted in.
      if (ms !== undefined) {
        timer = setTimeout(() => {
          cleanup();
          reject(new Error(`waitForItem timed out after ${ms}ms`));
        }, ms);
      }

      // Only wire abort handling when the caller passed a signal.
      if (signal) {
        onAbort = () => {
          cleanup();
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        };
        signal.addEventListener('abort', onAbort, { once: true });
      }
    });
  }

  /** Removes every recorded item, without affecting pending {@link waitForItem} calls. */
  clear(): void {
    this.#items = [];
  }

  /**
   * Tests whether `item` satisfies `matcher`.
   *
   * @param item - Item to test.
   * @param matcher - Item name, array of names, or a predicate.
   * @returns Whether `item` matches.
   */
  #matches(item: TelemetryItem, matcher: TelemetryItemMatcher): boolean {
    // String matcher: compare item name directly.
    if (typeof matcher === 'string') return item.name === matcher;
    // Array matcher: match against any of the given names.
    if (Array.isArray(matcher)) return matcher.includes(item.name);
    return matcher(item);
  }

  /** Completes the internal item stream, rejecting any pending `waitForItem` calls. */
  [Symbol.dispose]() {
    this.#items$.complete();
  }
}
