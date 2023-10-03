import { map } from 'rxjs/operators';
import { type State } from './FeatureFlagProvider.state';
import { OperatorFunction } from 'rxjs';
import type { IFeatureFlag } from './FeatureFlag';

export const featuresSelector = (): OperatorFunction<State, Array<IFeatureFlag>> => (state$) =>
    state$.pipe(map((state) => Object.values(state.features)));

export type FeatureSelectorFn = (feature: IFeatureFlag) => boolean;
export type FeatureSelector = string | FeatureSelectorFn;

export const filterFeatures =
    (selector: FeatureSelector): OperatorFunction<Array<IFeatureFlag>, Array<IFeatureFlag>> =>
    (source$) => {
        const filterFn =
            typeof selector === 'function'
                ? selector
                : (feature: IFeatureFlag) => feature.key === selector;
        return source$.pipe(map((features) => features.filter(filterFn)));
    };

export const findFeature =
    (selector: FeatureSelector): OperatorFunction<Array<IFeatureFlag>, IFeatureFlag | undefined> =>
    (source$) => {
        const findFn =
            typeof selector === 'function'
                ? selector
                : (feature: IFeatureFlag) => feature.key === selector;
        return source$.pipe(map((features) => features.find(findFn)));
    };

interface featureSelector {
    (selector: (feature: IFeatureFlag) => boolean): OperatorFunction<State, Array<IFeatureFlag>>;
    (name: string): OperatorFunction<State, Array<IFeatureFlag>>;
}

export function featureSelector(
    selector: FeatureSelector,
): OperatorFunction<State, Array<IFeatureFlag>> {
    return (source$) => source$.pipe(featuresSelector(), filterFeatures(selector));
}
