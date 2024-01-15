import type { ObservableInput } from 'rxjs';
import type { IFeatureFlag } from '../../FeatureFlag';

export type { FeatureFlagPlugin as ApiFeatureFlagPlugin } from '../../types';

/**
 * Interface for an Api Plugin client.
 */
export interface IApiPluginClient {
    /** Method for fetching Feature flags */
    getFeatureFlags(): ObservableInput<IFeatureFlag[]>;
    // @TODO: Not implemented for v1
    // storeFeatureFlags(flags: Array<IFeatureFlag>): void;
}

export type ApiResponseSelector = (response: Response) => ObservableInput<IFeatureFlag[]>;
