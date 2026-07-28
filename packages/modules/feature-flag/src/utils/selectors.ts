import { map } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';
import type { IFeatureFlag } from '../FeatureFlag';

export { findFeature } from './find-feature';

/**
 * Represents a function that selects a feature flag.
 * @template T - The type of the feature flag.
 * @param feature - The feature flag to be selected.
 * @returns A boolean value indicating whether the feature flag matches the specified type.
 */
export interface FeatureSelectorFn<T = unknown> {
  (feature: IFeatureFlag): feature is IFeatureFlag<T>;
  (feature: IFeatureFlag): boolean;
}

export type FeatureSelector<T = unknown> = string | FeatureSelectorFn<T>;

/**
 * Type definition for a feature comparator function.
 * @template T - The type of the feature flag.
 * @param a - The first feature flag to compare.
 * @param b - The second feature flag to compare.
 * @returns A boolean indicating whether the two feature flags are equal.
 */
export type FeatureComparator<T = unknown> = (a?: IFeatureFlag<T>, b?: IFeatureFlag<T>) => boolean;

export type Features = Record<string, IFeatureFlag>;

/**
 * Filters the features based on the provided selector function.
 *
 * @param selector - The function used to select the features.
 * @returns An operator function that filters the features and returns an array of IFeatureFlag.
 */
export const filterFeatures =
  (selector: FeatureSelectorFn): OperatorFunction<Features, Array<IFeatureFlag>> =>
  (source$) =>
    // narrow the current features down to just those matching the selector
    source$.pipe(
      map((features) =>
        Object.values(features)
          // keep only the flags matching the selector
          .filter(selector),
      ),
    );
