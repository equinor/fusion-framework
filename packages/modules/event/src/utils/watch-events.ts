import type { IEventModuleProvider } from '../EventModuleProvider';
import type { IFrameworkEvent } from '../FrameworkEvent';
import { applyEventMatcher, type EventMatcher } from './apply-event-matcher';

/**
 * A handle returned by {@link watchEvents} that exposes collected events and a
 * dispose method.
 */
export interface WatchEventsHandle {
  /**
   * All matching events collected so far, in dispatch order.
   * Only events passing the original matcher are ever stored.
   */
  readonly events: readonly IFrameworkEvent[];
  /**
   * Returns the most recently collected event, optionally narrowed to a
   * specific type.
   *
   * @param type - When provided, returns the last event with this type.
   */
  lastEvent(type?: string): IFrameworkEvent | undefined;
  /** Stops collecting events. Already-collected events remain accessible. */
  dispose(): void;
}

/**
 * Starts collecting events that match `matcher`, returning a handle for
 * reading collected events and stopping collection.
 *
 * Only events that pass `matcher` are ever stored — a high volume of
 * non-matching events does not cause unbounded memory growth.
 *
 * @param provider - The event module provider to observe.
 * @param matcher - Event type string, array of type strings, or a predicate.
 * @returns A handle with the collected events and a `dispose` method.
 *
 * @example
 * ```ts
 * const handle = watchEvents(provider, ['myFeature.saved', 'myFeature.deleted']);
 *
 * // ... run the code under test ...
 *
 * expect(handle.lastEvent('myFeature.saved')?.detail).toEqual({ id: 1 });
 * handle.dispose();
 * ```
 */
export function watchEvents(
  provider: IEventModuleProvider,
  matcher: EventMatcher,
): WatchEventsHandle {
  const collected: IFrameworkEvent[] = [];
  const sub = applyEventMatcher(provider, matcher).subscribe((event) => collected.push(event));

  return {
    get events(): readonly IFrameworkEvent[] {
      return collected;
    },
    lastEvent(type?: string): IFrameworkEvent | undefined {
      // Narrow to a specific type only when the caller asked for one.
      if (type !== undefined) {
        // Walk backward — avoids creating a reversed copy.
        for (let i = collected.length - 1; i >= 0; i--) {
          // Return on the first (most recent) match.
          if (collected[i].type === type) return collected[i];
        }
        return undefined;
      }
      return collected[collected.length - 1];
    },
    dispose() {
      sub.unsubscribe();
    },
  };
}
