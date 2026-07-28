import { map, distinctUntilChanged } from 'rxjs/operators';
import type { OperatorFunction } from 'rxjs';
import type { IFeatureFlag } from '../FeatureFlag';
import type { Features, FeatureComparator, FeatureSelector } from './selectors';

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
    return source$
      // resolve to the single feature flag matching the selector, if any, and skip re-emits
      .pipe(
        map((features) =>
          Object.values(features)
            // look up the first flag matching the selector
            .find(findFn),
        ),
        distinctUntilChanged(comparator),
      );
  };
};

export default findFeature;
