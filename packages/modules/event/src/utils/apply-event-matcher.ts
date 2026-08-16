import { filter, type Observable } from 'rxjs';

import type { IEventModuleProvider } from '../EventModuleProvider';
import type { FrameworkEventMap, IFrameworkEvent } from '../FrameworkEvent';
import { filterEvent } from '../operators/filter-event';

/**
 * A matcher that selects which events `waitForEvent` or `watchEvents` act on.
 *
 * - `string` — a single registered event type; uses the type-scoped `filterEvent` path.
 * - `string[]` — multiple event types; an event matching any entry passes.
 * - `(event) => boolean` — arbitrary predicate; filters the raw `event$` stream.
 */
export type EventMatcher =
  | keyof FrameworkEventMap
  | (string & Record<never, never>)
  | string[]
  | ((event: IFrameworkEvent) => boolean);

/**
 * Applies an {@link EventMatcher} to a provider's event stream.
 *
 * @param provider - The event module provider to observe.
 * @param matcher - Event type string, array of type strings, or a predicate.
 * @returns An observable emitting only events that pass `matcher`.
 */
export function applyEventMatcher(
  provider: IEventModuleProvider,
  matcher: EventMatcher,
): Observable<IFrameworkEvent> {
  // Single type: prefer the type-scoped filterEvent path over a raw predicate.
  if (typeof matcher === 'string') {
    // Narrow the stream to the matching FrameworkEventMap entry.
    return provider.event$.pipe(filterEvent(matcher as keyof FrameworkEventMap));
  }
  // Multiple types: match if the event type is any of the given entries.
  if (Array.isArray(matcher)) {
    // Keep only events whose type is in the matcher array.
    return provider.event$.pipe(filter((e) => matcher.includes(e.type)));
  }
  // Bare predicate: no type to scope on, filter the raw stream directly.
  return provider.event$.pipe(filter(matcher));
}
