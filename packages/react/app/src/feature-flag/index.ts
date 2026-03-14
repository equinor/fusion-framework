/**
 * Feature-flag sub-path entry-point.
 *
 * Provides the {@link enableFeatureFlag} configurator helper and the
 * {@link useFeature} hook for reading and toggling feature flags at runtime.
 *
 * @packageDocumentation
 */
export {
  IFeatureFlag,
  IFeatureFlagProvider,
  FeatureFlagModule,
} from '@equinor/fusion-framework-module-feature-flag';

export { enableFeatureFlag } from './enable-feature-flag';

export { useFeature } from './useFeature';
