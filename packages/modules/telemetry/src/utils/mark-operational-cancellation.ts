import { operationalErrorState } from '../lib/operational-error-state.js';

/**
 * Marks a deliberate cancellation without mutating the caller's error.
 * @template T - Error object type.
 * @param error - Original error.
 * @param reason - Optional controlled reason code.
 * @returns The original error.
 */
export function markOperationalCancellation<T extends object>(error: T, reason?: string): T {
  operationalErrorState.cancellations.add(error);
  // Reason codes are optional; an existing classification must survive an unqualified mark.
  if (reason) {
    operationalErrorState.reasons.set(error, reason);
  }
  return error;
}
