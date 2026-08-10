import { describe, expect, it } from 'vitest';

import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import type { FeatureFlagProvider } from '../../FeatureFlagProvider';
import { module as realModule } from '../../feature-flag-module';
import {
  FeatureFlagMockConfigurator,
  enableFeatureFlagMock,
  featureFlagMockModule,
} from '../../mock';

/**
 * Initializes the mock module through the real module system.
 *
 * @remarks
 * Deliberately avoids hand-building initialization arguments — the module
 * system itself is the thing under test, not a fake of it.
 *
 * @param configure - Callback to seed feature flags.
 * @returns The provider the module produced.
 */
const initializeMockWith = async (
  configure?: (mock: FeatureFlagMockConfigurator) => void,
): Promise<FeatureFlagProvider> => {
  const configurator = new ModulesConfigurator([]);
  enableFeatureFlagMock(configurator, configure);
  const instances = await configurator.initialize();
  // the configurator's generic instance map doesn't know about the feature-flag module by name
  return (instances as unknown as { featureFlag: FeatureFlagProvider }).featureFlag;
};

describe('featureFlagMockModule', () => {
  it('changes nothing but the configurator', () => {
    expect(featureFlagMockModule.name).toBe(realModule.name);
    expect(featureFlagMockModule.initialize).toBe(realModule.initialize);
  });

  it('builds a real FeatureFlagConfigurator, so the whole builder stays available', () => {
    const configurator = featureFlagMockModule.configure?.();

    expect(configurator).toBeInstanceOf(FeatureFlagMockConfigurator);
  });
});

describe('enableFeatureFlagMock', () => {
  it('initializes with no features when nothing is seeded', async () => {
    const provider = await initializeMockWith();

    expect(provider.features).toEqual({});
  });

  it('seeds a single flag as enabled through addFeature', async () => {
    const provider = await initializeMockWith((mock) =>
      mock.addFeature({ key: 'my-flag', enabled: true }),
    );

    expect(provider.getFeature('my-flag')?.enabled).toBe(true);
  });

  it('seeds multiple flags through setFeatures', async () => {
    const provider = await initializeMockWith((mock) =>
      mock.setFeatures([
        { key: 'dark-mode', enabled: true },
        { key: 'beta-search', enabled: false },
      ]),
    );

    expect(provider.hasFeature('dark-mode')).toBe(true);
    expect(provider.getFeature('beta-search')?.enabled).toBe(false);
  });

  it('toggles a seeded flag through the real provider, emitting the change on features$', async () => {
    const provider = await initializeMockWith((mock) =>
      mock.addFeature({ key: 'my-flag', enabled: false }),
    );

    const emissions: Array<boolean | undefined> = [];
    // capture every emission so the toggle can be asserted as an update, not just a final read
    provider.features$.subscribe((features) => emissions.push(features['my-flag']?.enabled));

    await provider.toggleFeature({ key: 'my-flag', enabled: true });

    expect(provider.getFeature('my-flag')?.enabled).toBe(true);
    expect(emissions).toEqual([false, true]);
  });

  it('rejects toggling an unseeded flag with a console warning instead of throwing', async () => {
    const provider = await initializeMockWith();

    await expect(
      provider.toggleFeature({ key: 'missing', enabled: true }),
    ).resolves.toBeUndefined();
    expect(provider.hasFeature('missing')).toBe(false);
  });
});
