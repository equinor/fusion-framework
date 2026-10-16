import type { History } from './lib/types.js';
import type { NavigationInitiator } from './NavigationInitiator.js';

const isHistory = (value: unknown): value is History =>
  typeof value === 'object' &&
  value !== null &&
  'push' in value &&
  typeof value.push === 'function' &&
  'replace' in value &&
  typeof value.replace === 'function' &&
  'location' in value;

/**
 * Validates an untrusted initiator value.
 *
 * @param value - Candidate initiator
 * @throws {TypeError} If the value is not a valid host or memory strategy
 */
export const assertNavigationInitiator: (value: unknown) => asserts value is NavigationInitiator = (
  value,
) => {
  // Reject anything that cannot carry a strategy discriminator
  if (typeof value !== 'object' || value === null || !('kind' in value)) {
    throw new TypeError("Invalid navigation initiator: expected { kind: 'host' | 'memory' }");
  }
  // Host strategy: requires the host-owned history and its basename
  if (value.kind === 'host') {
    // A host without a usable history cannot own navigation
    if (!('history' in value) || !isHistory(value.history)) {
      throw new TypeError("Invalid navigation initiator: kind 'host' requires a history");
    }
    // The basename is the required scope the host serves the app under
    if (!('basename' in value) || typeof value.basename !== 'string' || !value.basename) {
      throw new TypeError("Invalid navigation initiator: kind 'host' requires a basename");
    }
    return;
  }
  // Memory strategy: everything is optional, but basename must be a string when present
  if (value.kind === 'memory') {
    // Guard against non-string basenames that would break path composition
    if ('basename' in value && value.basename !== undefined && typeof value.basename !== 'string') {
      throw new TypeError("Invalid navigation initiator: kind 'memory' basename must be a string");
    }
    return;
  }
  throw new TypeError(`Invalid navigation initiator: unsupported kind '${String(value.kind)}'`);
};
