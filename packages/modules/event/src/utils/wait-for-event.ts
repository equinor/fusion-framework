import type { IEventModuleProvider } from '../EventModuleProvider';
import type { FrameworkEventMap, IFrameworkEvent } from '../FrameworkEvent';
import { applyEventMatcher, type EventMatcher } from './apply-event-matcher';

/** Options accepted by {@link waitForEvent}. */
export interface WaitForEventOptions {
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
 * Waits for the next event that matches `matcher` and resolves with it.
 *
 * Uses `filterEvent` internally when `matcher` is a single registered type,
 * giving the same type narrowing already provided by that operator.
 *
 * @template TType - A registered event name from {@link FrameworkEventMap}.
 * @param provider - The event module provider to observe.
 * @param matcher - Event type string, array of type strings, or a predicate.
 * @param options - Optional timeout (ms) or AbortSignal.
 * @returns A promise that resolves with the first matching event.
 *
 * @example
 * ```ts
 * // Single type — resolves with FrameworkEventMap['onModulesLoaded']
 * const event = await waitForEvent(provider, 'onModulesLoaded');
 *
 * // Array — resolves on whichever fires first
 * const event = await waitForEvent(provider, ['myFeature.saved', 'myFeature.updated']);
 *
 * // Predicate — filters on payload, not just type
 * const event = await waitForEvent(provider, (e) => e.detail?.id === 1);
 *
 * // With a timeout so a missing event fails fast
 * const event = await waitForEvent(provider, 'myFeature.saved', { timeout: 1000 });
 * ```
 */
export function waitForEvent<TType extends keyof FrameworkEventMap>(
  provider: IEventModuleProvider,
  matcher: TType,
  options?: WaitForEventOptions,
): Promise<FrameworkEventMap[TType]>;

/**
 * Overload for an array of event types or a payload predicate, where the
 * result cannot be narrowed to a single {@link FrameworkEventMap} entry.
 *
 * @param provider - The event module provider to observe.
 * @param matcher - An array of event type strings, or a predicate.
 * @param options - Optional timeout (ms) or AbortSignal.
 * @returns A promise that resolves with the first matching event.
 */
export function waitForEvent(
  provider: IEventModuleProvider,
  matcher: string | string[] | ((event: IFrameworkEvent) => boolean),
  options?: WaitForEventOptions,
): Promise<IFrameworkEvent>;

/**
 * Implementation shared by both {@link waitForEvent} overloads above.
 *
 * @param provider - The event module provider to observe.
 * @param matcher - Event type string, array of type strings, or a predicate.
 * @param options - Optional timeout (ms) or AbortSignal.
 * @returns A promise that resolves with the first matching event.
 */
export function waitForEvent(
  provider: IEventModuleProvider,
  matcher: EventMatcher,
  options?: WaitForEventOptions,
): Promise<IFrameworkEvent> {
  return new Promise<IFrameworkEvent>((resolve, reject) => {
    const { timeout: ms, signal } = options ?? {};

    // Fail fast without subscribing when the caller already aborted.
    if (signal?.aborted) {
      reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
      return;
    }

    const source$ = applyEventMatcher(provider, matcher);
    let timer: ReturnType<typeof setTimeout> | undefined;

    const cleanup = (err?: unknown) => {
      clearTimeout(timer);
      sub.unsubscribe();
      // Only reject when cleanup was triggered by an error, not a resolved match.
      if (err !== undefined) reject(err);
    };

    const sub = source$.subscribe({
      next: (event) => {
        cleanup();
        resolve(event);
      },
      error: (err) => cleanup(err),
      complete: () =>
        cleanup(new Error('Event stream completed before a matching event was received')),
    });

    // Only arm a timeout when the caller opted in.
    if (ms !== undefined) {
      timer = setTimeout(() => {
        sub.unsubscribe();
        reject(new Error(`waitForEvent timed out after ${ms}ms`));
      }, ms);
    }

    // Only wire abort handling when the caller passed a signal.
    if (signal) {
      signal.addEventListener(
        'abort',
        () => {
          sub.unsubscribe();
          clearTimeout(timer);
          reject(signal.reason ?? new DOMException('Aborted', 'AbortError'));
        },
        { once: true },
      );
    }
  });
}
