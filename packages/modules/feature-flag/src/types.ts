import { ObservableInput, Subscription } from 'rxjs';

import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import { IFeatureFlagProvider } from './FeatureFlagProvider';
import { IFeatureFlag } from './FeatureFlag';

export type { IFeatureFlag } from './FeatureFlag';

export interface FeatureFlagPlugin {
    order?: number;
    /**
     * connect the plugin to the provider
     */
    connect?: (args: { provider: IFeatureFlagProvider }) => VoidFunction | Subscription;

    /**
     * generate initial value for the provider
     */
    initial?: () => ObservableInput<Array<IFeatureFlag>>;
}

export type FeatureFlagPluginConfigCallback<T extends FeatureFlagPlugin = FeatureFlagPlugin> = (
    args: ConfigBuilderCallbackArgs,
) => ObservableInput<T>;

export type FeatureFlagConfig = {
    initial: IFeatureFlag[];
    plugins: Array<FeatureFlagPlugin>;
};
