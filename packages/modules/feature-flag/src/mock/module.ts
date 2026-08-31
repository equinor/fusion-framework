import type { IModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as realModule, type FeatureFlagModule } from '../feature-flag-module.js';

import { FeatureFlagMockConfigurator } from './FeatureFlagMockConfigurator.js';

/**
 * The feature-flag module with an in-memory mock configurator instead of a
 * real plugin.
 *
 * @remarks
 * Only `configure` differs from the real module. `initialize` is the
 * production one, untouched, so a test exercises the real
 * `FeatureFlagProvider` startup path, `toggleFeature`/`toggleFeatures`, and
 * `onFeatureToggle` — a rehearsal of the module, not a stand-in for it.
 */
export const featureFlagMockModule: FeatureFlagModule = {
  ...realModule,
  configure: () => new FeatureFlagMockConfigurator(),
};

/**
 * Configuration callback for {@link enableFeatureFlagMock}.
 */
export type FeatureFlagMockConfigFn = (mock: FeatureFlagMockConfigurator) => void | Promise<void>;

/**
 * Enables the feature-flag module against in-memory seeded flags, so a test
 * needs no `localStorage` and no URL to seed which features are enabled.
 *
 * @remarks
 * Registered last, this replaces whichever feature-flag module the
 * configurator already carries, so it works on a configurator that
 * pre-registers the real one.
 *
 * @param configurator - The modules configurator to register on.
 * @param configure - Optional callback to seed feature flags.
 *
 * @example
 * ```ts
 * enableFeatureFlagMock(configurator, (mock) => {
 *   mock.addFeature({ key: 'my-flag', enabled: true });
 * });
 * ```
 */
export const enableFeatureFlagMock = (
  // biome-ignore lint/suspicious/noExplicitAny: must be any to support all module types
  configurator: IModulesConfigurator<any, any>,
  configure?: FeatureFlagMockConfigFn,
): void => {
  configurator.addConfig({ module: featureFlagMockModule, configure } as {
    module: FeatureFlagModule;
  });
};
