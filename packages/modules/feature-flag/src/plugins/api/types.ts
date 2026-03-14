import type { ObservableInput } from 'rxjs';
import type { IFeatureFlag } from '../../FeatureFlag';

export type { FeatureFlagPlugin as ApiFeatureFlagPlugin } from '../../types';

/**
 * HTTP client interface consumed by {@link ApiPlugin} to fetch feature flags
 * from a remote API.
 */
export interface IApiPluginClient {
  /** Fetches the current set of feature flags from the API. */
  getFeatureFlags(): ObservableInput<IFeatureFlag[]>;
}

/**
 * Function that maps an HTTP `Response` to an array of {@link IFeatureFlag}.
 */
export type ApiResponseSelector = (response: Response) => ObservableInput<IFeatureFlag[]>;
