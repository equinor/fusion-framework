import { map } from 'rxjs/operators';
import { type State } from './state';
import { OperatorFunction } from 'rxjs';
import { FeatureFlag } from '../FeatureFlag';
import { Range as SemverRange, satisfies } from 'semver';

export const featuresSelector = (): OperatorFunction<State, Array<FeatureFlag>> => (state$) =>
    state$.pipe(map((state) => Object.values(state.features)));

export interface featureSelector {
    (selector: (feature: FeatureFlag) => boolean): OperatorFunction<State, Array<FeatureFlag>>;
    (name: string, options?: FilterFeaturesOptions): OperatorFunction<State, Array<FeatureFlag>>;
}

export type FeatureSelectorFn = (feature: FeatureFlag) => boolean;
export type FeatureSelector = string | FeatureSelectorFn;

export type FilterFeaturesOptions = { range?: string | SemverRange };

export const filterFeatures =
    (
        selector: FeatureSelector,
        options?: FilterFeaturesOptions,
    ): OperatorFunction<Array<FeatureFlag>, Array<FeatureFlag>> =>
    (source$) => {
        const filterFn =
            typeof selector === 'function'
                ? selector
                : (feature: FeatureFlag) => {
                      const [name, semver] = selector.split('@');
                      if (feature.name !== name) {
                          return false;
                      }
                      if (options && 'range' in options && options?.range) {
                          if (!feature.semver) {
                              return false;
                          }
                          return satisfies(feature.semver, options.range);
                      }
                      if (semver && semver !== feature.version) {
                          return false;
                      }
                      return feature.name === name;
                  };
        return source$.pipe(map((features) => features.filter(filterFn)));
    };

export function featureSelector(
    selector: FeatureSelector,
    options?: FilterFeaturesOptions,
): OperatorFunction<State, Array<FeatureFlag>> {
    return (source$) => source$.pipe(featuresSelector(), filterFeatures(selector, options));
}
