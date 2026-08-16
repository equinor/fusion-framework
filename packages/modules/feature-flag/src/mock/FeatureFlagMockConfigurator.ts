import { of } from 'rxjs';

import { FeatureFlagConfigurator } from '../FeatureFlagConfigurator.js';
import type { IFeatureFlag } from '../FeatureFlag.js';

/**
 * A {@link FeatureFlagConfigurator} backed by in-memory seeded flags instead
 * of a real plugin, for seeding feature-flag state in tests.
 *
 * @remarks
 * `feature-flag` has no default flags — a real app opts in to
 * `enableLocalFeatures` (persists to `localStorage`) or `enableUrlToggle`
 * (reads the current URL), both awkward in a test. This registers a single
 * in-memory plugin instead, through the same {@link FeatureFlagConfigurator.addPlugin}
 * every other plugin uses, so seeded flags flow through the real
 * `FeatureFlagProvider` startup path exactly like a real plugin's flags would.
 *
 * No flags are assumed by default — an empty seed set resolves to an empty
 * `features` map, matching today's real zero-plugin behaviour. Toggling a
 * seeded flag (`toggleFeature`/`toggleFeatures`) needs no extra wiring here,
 * since that already runs entirely through `FeatureFlagProvider`.
 *
 * @example Seed a flag as enabled
 * ```ts
 * enableFeatureFlagMock(configurator, (mock) => {
 *   mock.addFeature({ key: 'my-flag', enabled: true });
 * });
 * ```
 *
 * @example Seed multiple flags at once
 * ```ts
 * enableFeatureFlagMock(configurator, (mock) => {
 *   mock.setFeatures([
 *     { key: 'dark-mode', enabled: true },
 *     { key: 'beta-search', enabled: false },
 *   ]);
 * });
 * ```
 */
export class FeatureFlagMockConfigurator extends FeatureFlagConfigurator {
  #flags = new Map<string, IFeatureFlag>();

  /**
   * Registers the in-memory seed pool as a plugin up front, so the real
   * `FeatureFlagConfigurator._processConfig` never needs a real plugin to
   * resolve an initial flag set from.
   */
  constructor() {
    super();
    // `initial` is read lazily on module initialization, after a test has seeded flags
    this.addPlugin(() => of({ initial: () => of([...this.#flags.values()]) }));
  }

  /**
   * Seeds multiple feature flags, making each readable by key.
   *
   * @param flags - The feature flags to seed.
   * @returns This configurator, for chaining.
   */
  public setFeatures(flags: Array<IFeatureFlag>): this {
    // seed every flag so each is individually readable by key
    for (const flag of flags) this.#flags.set(flag.key, flag);
    return this;
  }

  /**
   * Seeds a single feature flag, making it readable by key.
   *
   * @param flag - The feature flag to seed.
   * @returns This configurator, for chaining.
   */
  public addFeature(flag: IFeatureFlag): this {
    this.#flags.set(flag.key, flag);
    return this;
  }
}

export default FeatureFlagMockConfigurator;
