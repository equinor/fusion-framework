import { operationalErrorState } from '../lib/operational-error-state.js';

/**
 * Associates a controlled reason code with an error without changing it.
 * @template T - Error object type.
 * @param error - Original error.
 * @param reason - Static reason code, never error text.
 * @returns The original error.
 */
export function markOperationalReason<T extends object>(error: T, reason: string): T {
  operationalErrorState.reasons.set(error, reason);
  return error;
}
