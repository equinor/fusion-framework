import { describe, expect } from 'vitest';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';
import { mockFramework } from '@equinor/fusion-framework/mock';
import type { Fusion } from '@equinor/fusion-framework';
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';

import { FeatureFlags } from './FeatureFlags';

// useFeature() merges the app's own flags with a framework-level `featureFlag` module,
// like a real portal registers; mock an empty one here so it resolves instead of warning.
describe('with framework feature flags enabled', () => {
  test.override('fusion', async (): Promise<Fusion> => {
    return (await mockFramework((configurator) => enableFeatureFlagMock(configurator))) as Fusion;
  });

  test('renders every configured flag and toggles the basic flag', async ({ render }) => {
    const { getByRole, unmount } = await render(<FeatureFlags />);

    await expect.element(getByRole('heading', { name: /feature flags/i })).toBeInTheDocument();

    // rendered in config.ts registration order: basic, with description, read only, with value
    const toggles = getByRole('checkbox');
    await expect.element(toggles.nth(2)).toBeDisabled();

    await expect.element(toggles.nth(0)).not.toBeChecked();
    await toggles.nth(0).click();
    await expect.element(toggles.nth(0)).toBeChecked();

    await unmount();
  });
});
