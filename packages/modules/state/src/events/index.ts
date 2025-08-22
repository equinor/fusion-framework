/**
 * @fileoverview State event exports and type definitions.
 * This module provides a centralized export point for all state-related events.
 */

// Export state operation events
export { StateOperationEvent } from './state-operation-event.js';

// Export state change events
export { StateChangeEvent } from './state-change-event.js';

// Export state error events
export { StateErrorEvent } from './state-error-event.js';

// Import the specific classes needed for the union type
import type { StateOperationEvent } from './state-operation-event.js';
import type { StateChangeEvent } from './state-change-event.js';
import type { StateErrorEvent } from './state-error-event.js';

/**
 * Union type representing all possible state events.
 * This type can be used for event handling when you need to handle any state-related event.
 */
export type StateEvent = StateOperationEvent | StateChangeEvent | StateErrorEvent;
