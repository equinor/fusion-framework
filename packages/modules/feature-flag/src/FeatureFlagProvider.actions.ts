import { type ActionTypes, createAction } from '@equinor/fusion-observable';
import type { IFeatureFlag } from './FeatureFlag';

/**
 * Action creators for mutating the feature-flag state.
 *
 * - `setFeatures` — replaces (upserts) flags in the store.
 * - `toggleFeatures` — updates the `enabled` property on existing flags.
 */
export const actions = {
  /** Upserts an array of feature flags into the store. */
  setFeatures: createAction('set_features_enabled', (payload: Array<IFeatureFlag>) => ({
    payload,
  })),
  /** Toggles the `enabled` field on an array of existing feature flags. */
  toggleFeatures: createAction('toggle_features_enabled', (payload: Array<IFeatureFlag>) => ({
    payload,
  })),
};

/** Union of all feature-flag action types. */
export type Actions = ActionTypes<typeof actions>;

export default actions;
