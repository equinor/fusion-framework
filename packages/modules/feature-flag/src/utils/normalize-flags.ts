import type { IFeatureFlag } from '../FeatureFlag';

/**
 * Converts an array of feature flags into a key-indexed record.
 *
 * @template T - Feature flag type (defaults to {@link IFeatureFlag}).
 * @param flags - Array of feature flags to normalise.
 * @returns A record mapping each flag's `key` to its object.
 */
export const normalizeFlags = <T extends IFeatureFlag = IFeatureFlag>(
  flags: Array<T>,
): Record<string, T> =>
  flags
    // key each flag by its own `key`, so later lookups can go straight to it
    .reduce((acc, flag) => {
      // mutate and return the accumulator so each flag ends up keyed by itself
      return Object.assign(acc, { [flag.key]: flag });
    }, {});

export default normalizeFlags;
