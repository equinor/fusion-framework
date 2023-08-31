import { FlowSubject } from '@equinor/fusion-observable';
import { FeatureFlag } from '../FeatureFlag';
import { Actions } from './actions';
import { makeReducer } from './reducer';

export type State = {
    features: Record<string, FeatureFlag>;
};

export type Store = FlowSubject<State, Actions>;

const defaultInitial: State = { features: {} } satisfies State;

export const createState = (initial?: State): Store =>
    new FlowSubject<State, Actions>(makeReducer(initial ?? defaultInitial));
