import type { ObservableInput, Subscription } from 'rxjs';

import type { ConfigBuilderCallbackArgs } from '@equinor/fusion-framework-module';

import type { IFeatureFlagProvider } from './FeatureFlagProvider';
import type { IFeatureFlag } from './FeatureFlag';

export type { IFeatureFlag } from './FeatureFlag';

/**
 * Defines the lifecycle hooks a feature-flag plugin can implement.
 *
 * Plugins are pluggable units that supply initial flags, react to toggle
 * actions, or persist flag state to an external store.
 */
export interface FeatureFlagPlugin {
  /**
   * Controls the evaluation order when multiple plugins provide initial flags.
   * Lower values run first.
   */
  order?: number;

  /**
   * Called after the provider is created to let the plugin subscribe to
   * provider events (e.g. persisting toggled flags to storage).
   *
   * @param args - Object containing the initialised {@link IFeatureFlagProvider}.
   * @returns A teardown function or RxJS `Subscription` to clean up on disposal.
   */
  connect?: (args: { provider: IFeatureFlagProvider }) => VoidFunction | Subscription;

  /**
   * Returns the initial set of feature flags this plugin contributes.
   *
   * @returns An observable input that emits an array of {@link IFeatureFlag}.
   */
  initial?: () => ObservableInput<Array<IFeatureFlag>>;
}

/**
 * Factory function returned by plugin creators (e.g. `createLocalStoragePlugin`).
 *
 * During module initialisation the framework invokes this callback with
 * configuration arguments so the plugin can resolve its dependencies before
 * returning a {@link FeatureFlagPlugin} instance.
 *
 * @template T - The concrete plugin type.
 */
export type FeatureFlagPluginConfigCallback<T extends FeatureFlagPlugin = FeatureFlagPlugin> = (
  args: ConfigBuilderCallbackArgs,
) => ObservableInput<T>;

/**
 * Resolved configuration consumed by the {@link FeatureFlagProvider}.
 */
export type FeatureFlagConfig = {
  /** Feature flags collected from all plugins during initialisation. */
  initial: IFeatureFlag[];
  /** Initialised plugin instances. */
  plugins: Array<FeatureFlagPlugin>;
};
