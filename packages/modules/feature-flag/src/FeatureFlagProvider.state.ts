import { FlowSubject } from '@equinor/fusion-observable';
import type { Actions } from './FeatureFlagProvider.actions';
import { makeReducer } from './FeatureFlagProvider.reducer';
import type { IFeatureFlag } from './FeatureFlag';

/** Internal state shape for the feature-flag store. */
export type State = {
  /** Map of feature-flag keys to their current {@link IFeatureFlag} snapshot. */
  features: Record<string, IFeatureFlag>;
};

/** RxJS `FlowSubject` that drives the feature-flag state. */
export type Store = FlowSubject<State, Actions>;

const defaultInitial: State = { features: {} } satisfies State;

/**
 * Creates a new feature-flag state store.
 *
 * @param initial - Optional pre-populated state. Falls back to an empty feature map.
 * @returns A reactive {@link Store} instance.
 */
export const createState = (initial?: State): Store =>
  new FlowSubject<State, Actions>(makeReducer(initial ?? defaultInitial));
