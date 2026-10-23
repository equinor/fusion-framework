import type { OperationalOutcome } from '../schemas/index.js';
import { operationalErrorState } from '../lib/operational-error-state.js';

/**
 * Classifies failure or cancellation through at most five wrapped causes.
 * @param error - Original operation error.
 * @returns Terminal outcome and an optional controlled reason.
 */
export function classifyOperationalError(error: unknown): {
  outcome: OperationalOutcome;
  reason?: string;
} {
  let current = error;
  let reason: string | undefined;
  // Bound traversal even for cyclic causes.
  for (let depth = 0; depth < 5 && current && typeof current === 'object'; depth++) {
    reason ??= operationalErrorState.reasons.get(current);
    // A marked nested cancellation wins over a wrapping failure.
    if (operationalErrorState.cancellations.has(current)) {
      return { outcome: 'cancelled', reason };
    }
    current = 'cause' in current ? current.cause : undefined;
  }
  return { outcome: 'failure', reason };
}
