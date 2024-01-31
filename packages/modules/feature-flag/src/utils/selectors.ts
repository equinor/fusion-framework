import { map, distinctUntilChanged } from 'rxjs/operators';
import { type OperatorFunction } from 'rxjs';
import type { IFeatureFlag } from '../FeatureFlag';

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

type Features = Record<string, IFeatureFlag>;

/**
 * Filters the features based on the provided selector function.
 *
 * @param selector - The function used to select the features.
 * @returns An operator function that filters the features and returns an array of IFeatureFlag.
 */
export const filterFeatures =
    (selector: FeatureSelectorFn): OperatorFunction<Features, Array<IFeatureFlag>> =>
    (source$) =>
        source$.pipe(map((features) => Object.values(features).filter(selector)));

/**
 * Finds a feature flag based on the provided selector and comparator.
 * This operator will not re-emit unless returned value from selector changes
 *
 * @template T - The type of the feature flag value.
 * @param {FeatureSelector<T>} selector - The selector function or key to match the feature flag.
 * @param {FeatureComparator<T>} [comparator] - The optional comparator function to compare feature flag values.
 * @returns {OperatorFunction<Features, IFeatureFlag<T> | undefined>} - The operator function that performs the feature flag search.
 */
export const findFeature = <T = unknown>(
    selector: FeatureSelector<T>,
    comparator?: FeatureComparator<T>,
): OperatorFunction<Features, IFeatureFlag<T> | undefined> => {
    const findFn: (feature: IFeatureFlag) => feature is IFeatureFlag<T> =
        typeof selector === 'function'
            ? selector
            : (feature: IFeatureFlag): feature is IFeatureFlag<T> => feature.key === selector;
    return (source$) => {
        return source$.pipe(
            map((features) => Object.values(features).find(findFn)),
            distinctUntilChanged(comparator),
        );
    };
};
