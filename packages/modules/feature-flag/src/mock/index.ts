/**
 * Test doubles for the feature-flag module.
 *
 * @remarks
 * Imported from `@equinor/fusion-framework-module-feature-flag/mock`, so the
 * mock ships and versions with the implementation it stands in for.
 *
 * `feature-flag` has no built-in flags and no network boundary of its own —
 * unlike `services`/`telemetry`, there's nothing here to keep off the
 * network. The gap this closes is ergonomic: the two built-in plugins,
 * `enableLocalFeatures` (persists to real `localStorage`) and
 * `enableUrlToggle` (reads the current URL), are both awkward for a test to
 * seed through. This registers an in-memory plugin instead, so a test seeds
 * flags directly with no persistence side effects and no browser API
 * dependency, while `toggleFeature`, `toggleFeatures`, and `onFeatureToggle`
 * all still run through the real `FeatureFlagProvider`.
 *
 * @example
 * ```typescript
 * import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';
 *
 * enableFeatureFlagMock(configurator, (mock) => {
 *   mock.addFeature({ key: 'my-flag', enabled: true });
 * });
 * ```
 *
 * @packageDocumentation
 */
export { FeatureFlagMockConfigurator } from './FeatureFlagMockConfigurator.js';
export {
  enableFeatureFlagMock,
  featureFlagMockModule,
  type FeatureFlagMockConfigFn,
} from './module.js';
