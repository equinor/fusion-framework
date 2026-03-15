/**
 * Feature-flag React hooks.
 *
 * @remarks
 * Available via the `@equinor/fusion-framework-react/feature-flag` sub-entry-point.
 * Provides hooks to read, toggle, and observe feature flags at the
 * framework or application level.
 *
 * @module
 */
export { useFeature } from './useFeature';
export { useFeatures } from './useFeatures';
export { useCurrentAppFeatures } from './useCurrentAppFeatures';
export { useFrameworkFeature } from './useFrameworkFeature';
export { useFrameworkFeatures } from './useFrameworkFeatures';

export { IFeatureFlag, IFeatureFlagProvider } from '@equinor/fusion-framework-module-feature-flag';
