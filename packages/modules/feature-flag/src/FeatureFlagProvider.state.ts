import { FlowSubject } from '@equinor/fusion-observable';
import { type Actions } from './FeatureFlagProvider.actions';
import { makeReducer } from './FeatureFlagProvider.reducer';
import { type IFeatureFlag } from './FeatureFlag';

export type State = {
    features: Record<string, IFeatureFlag>;
};

export type Store = FlowSubject<State, Actions>;

const defaultInitial: State = { features: {} } satisfies State;

export const createState = (initial?: State): Store =>
    new FlowSubject<State, Actions>(makeReducer(initial ?? defaultInitial));
