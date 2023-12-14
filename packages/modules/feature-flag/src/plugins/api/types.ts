import type { ObservableInput } from 'rxjs';
import type { IFeatureFlag } from '../../FeatureFlag';

export type { FeatureFlagPlugin as ApiFeatureFlagPlugin } from '../../types';

export interface IApiPluginClient {
    getFeatureFlags(): ObservableInput<IFeatureFlag[]>;
    // @TODO: Not implemented for v1
    // storeFeatureFlags(flags: Array<IFeatureFlag>): void;
}

export type ApiResponseSelector = (response: Response) => ObservableInput<IFeatureFlag[]>;
