import type {
    BaseConfigBuilder,
    ConfigBuilderCallbackArgs,
} from '@equinor/fusion-framework-module';
import { Observable, ObservableInput, Subscription } from 'rxjs';
import { FeatureFlag, FeatureFlagObj } from './FeatureFlag';

export interface FeatureFlagPlugin {
    initialize: (args: { provider: IFeatureFlagProvider }) => VoidFunction | Subscription;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initial?: () => ObservableInput<FeatureFlagObj<any>[]>;
}

export type FeatureFlagPluginConfigCallback<T extends FeatureFlagPlugin = FeatureFlagPlugin> = (
    args: ConfigBuilderCallbackArgs,
) => ObservableInput<T>;

export type FeatureFlagConfig = {
    initial: FeatureFlagObj[];
    plugins: Array<FeatureFlagPlugin>;
};

export interface IFeatureFlagConfigurator extends BaseConfigBuilder<FeatureFlagConfig> {
    addPlugin: (handler: FeatureFlagPluginConfigCallback) => void;
}

export interface IFeatureFlagProvider {
    readonly features$: Observable<Array<FeatureFlag>>;
    toggleFeature(feature: { key: string; enabled: boolean }): void;
    toggleFeatures(features: Array<{ key: string; enabled: boolean }>): void;
}

/**
 *
 *
 *
 *
 *
 *
 *
 *
 *
 */

// export type FeatureFlagHandler = (args: { provider: IFeatureFlagProvider }) => VoidFunction;

// export type FeatureFlagHandlerConfigCallback = (
//     args: ConfigBuilderCallbackArgs,
// ) => ObservableInput<FeatureFlagHandler>;

// export type FeatureFlagAdapterConfigCallback = (
//     args: ConfigBuilderCallbackArgs,
// ) => ObservableInput<FeatureFlagStateAdapter>;

// export interface FeatureFlagStateAdapter {
//     next: (state: State) => ObservableInput<void>;
//     initial?: (initial?: State) => ObservableInput<State | void>;
// }
