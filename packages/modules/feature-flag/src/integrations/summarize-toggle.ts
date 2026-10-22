import type { IFeatureFlag } from '../FeatureFlag.js';

/** Count-only summary of one toggle request; feature keys and values are never included. */
export type ToggleCounts = {
  /** Flags the caller asked to toggle. */
  requested: number;
  /** Unregistered or read-only flags, which are never toggled. */
  rejected: number;
};

/** Counts of a completed toggle request. */
export type ToggleResultCounts = ToggleCounts & {
  /** Flags applied to the state. */
  applied: number;
  /** Writable flags not applied, because a listener vetoed or a later flag superseded them. */
  cancelled: number;
};

/**
 * Summarizes a toggle request as counts for operational telemetry.
 *
 * Every requested flag that is registered and writable is either applied or not; the ones not
 * applied were vetoed by a listener or superseded by a later flag of the same request, so they
 * are counted as `cancelled`. Without a result, such as when the request fails, only the
 * `requested` and `rejected` counts are known.
 *
 * @param values - The requested toggles.
 * @param features - Registered flags at the time of the request.
 * @param applied - Number of toggles applied, when the request completed.
 * @returns The request's counts.
 */
export function summarizeToggle(
  values: ReadonlyArray<{ key: string }>,
  features: Readonly<Record<string, IFeatureFlag>>,
): ToggleCounts;
export function summarizeToggle(
  values: ReadonlyArray<{ key: string }>,
  features: Readonly<Record<string, IFeatureFlag>>,
  applied: number,
): ToggleResultCounts;
/**
 * Implementation of both {@link summarizeToggle} signatures.
 * @param values - The requested toggles.
 * @param features - Registered flags at the time of the request.
 * @param applied - Number of toggles applied, when the request completed.
 * @returns The request's counts, including `applied` and `cancelled` when a result exists.
 */
export function summarizeToggle(
  values: ReadonlyArray<{ key: string }>,
  features: Readonly<Record<string, IFeatureFlag>>,
  applied?: number,
): ToggleCounts | ToggleResultCounts {
  const requested = values.length;
  // Unregistered and read-only flags are skipped by the toggle flow before any listener runs.
  const rejected = values.filter(({ key }) => !features[key] || features[key].readonly).length;
  // A failed request has no result to compare against.
  if (applied === undefined) {
    return { requested, rejected };
  }
  return { requested, rejected, cancelled: requested - rejected - applied, applied };
}
