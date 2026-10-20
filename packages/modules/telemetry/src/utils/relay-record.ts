import type { ITelemetryProvider } from '../TelemetryProvider.interface.js';
import type { TelemetryItem } from '../types.js';

/** A child's routing policy for records relayed to its parent. */
export interface RelayPolicy {
  /** Whether an explicit child exporter owns delivery, suppressing the parent's fallback exporters. */
  ownsExport: boolean;
  /** Relay filter; `false` rejects the record intentionally. */
  relay?: (item: TelemetryItem) => boolean;
}

/**
 * Relays one record to a parent provider under the child's routing policy.
 *
 * Shared by live provider relay and startup recovery, so both honour the same relay filter
 * and exporter ownership.
 *
 * @param target - Parent provider.
 * @param item - Record to relay.
 * @param policy - Child exporter ownership and relay filter.
 * @returns `true` when the parent accepted the record or the filter intentionally rejected it;
 *   `false` when the parent cannot honour ownership (a legacy parent and an owned record).
 * @throws Rethrows relay filter and parent delivery errors for the caller's health reporting.
 */
export function relayRecord(
  target: ITelemetryProvider,
  item: TelemetryItem,
  policy: RelayPolicy,
): boolean {
  // Reject intentionally filtered records without changing export ownership.
  if (policy.relay && !policy.relay(item)) {
    return true;
  }
  // Ownership-aware parents suppress their fallback exporters for records a child owns.
  if (target.trackRelayed) {
    target.trackRelayed(item, policy.ownsExport);
    return true;
  }
  // Legacy parents cannot honour ownership, so they only receive records no child owns.
  if (!policy.ownsExport) {
    target.track(item);
    return true;
  }
  return false;
}
