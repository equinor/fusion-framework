import { type ActionTypes, createAction } from '@equinor/fusion-observable';
import { FeatureFlag } from '../FeatureFlag';

export const actions = {
    setFeature: createAction('set_feature_flag', (payload: FeatureFlag) => ({
        payload,
    })),
    setFeatureEnabled: createAction(
        'set_feature_enabled',
        (payload: { key: string; enabled: boolean }) => ({
            payload,
        }),
    ),
    setFeaturesEnabled: createAction(
        'set_features_enabled',
        (payload: Array<{ key: string; enabled: boolean }>) => ({
            payload,
        }),
    ),
};

export type Actions = ActionTypes<typeof actions>;

export default actions;
