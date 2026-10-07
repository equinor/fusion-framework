/**
 * Plain helper functions for waiting on and collecting dispatched framework events.
 *
 * @module @equinor/fusion-framework-module-event/utils
 */

export type { EventMatcher } from './apply-event-matcher.js';
export { waitForEvent, type WaitForEventOptions } from './wait-for-event.js';
export { watchEvents, type WatchEventsHandle } from './watch-events.js';
