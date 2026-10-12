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
export { useFeature } from './useFeature.js';
export { useFeatures } from './useFeatures.js';
export { useCurrentAppFeatures } from './useCurrentAppFeatures.js';
export { useFrameworkFeature } from './useFrameworkFeature.js';
export { useFrameworkFeatures } from './useFrameworkFeatures.js';

export { IFeatureFlag, IFeatureFlagProvider } from '@equinor/fusion-framework-module-feature-flag';
