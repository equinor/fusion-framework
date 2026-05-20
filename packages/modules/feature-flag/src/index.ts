/**
 * Feature-flag module for the Fusion Framework.
 *
 * Enables runtime feature toggling with typed flag definitions.
 * Flags are configured at build time via {@link FeatureFlagConfigurator}
 * and read at runtime through {@link FeatureFlagProvider}.
 *
 * @see {@link enableFeatureFlagging} to enable the module in a configurator.
 *
 * @packageDocumentation
 */
export * from './types';

export { type IFeatureFlagConfigurator, FeatureFlagConfigurator } from './FeatureFlagConfigurator';
export { type IFeatureFlagProvider, FeatureFlagProvider } from './FeatureFlagProvider';
export {
  default,
  module as featureFlagModule,
  enableFeatureFlagging,
  type FeatureFlagModule,
  type FeatureFlagBuilderCallback,
} from './FeatureFlagModule';
