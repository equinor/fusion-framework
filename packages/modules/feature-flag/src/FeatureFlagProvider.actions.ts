import { type ActionTypes, createAction } from '@equinor/fusion-observable';
import { IFeatureFlag } from './FeatureFlag';

export const actions = {
    setFeatures: createAction('set_features_enabled', (payload: Array<IFeatureFlag>) => ({
        payload,
    })),
    toggleFeatures: createAction('toggle_features_enabled', (payload: Array<IFeatureFlag>) => ({
        payload,
    })),
};

export type Actions = ActionTypes<typeof actions>;

export default actions;
