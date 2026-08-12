import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { enableFeatureFlagMock } from '@equinor/fusion-framework-module-feature-flag/mock';
import type { FeatureFlagModule } from '@equinor/fusion-framework-module-feature-flag';

import { useFeature } from '../feature-flag/useFeature';
import { renderAppHook } from '../vitest/render-app-hook';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

describe('useFeature', () => {
  it('resolves a flag seeded on the app scope when the framework has no feature-flag module', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    const configure: AppMockConfigureFn<[FeatureFlagModule]> = (configurator) => {
      enableFeatureFlagMock(configurator, (mock) => {
        mock.addFeature({ key: 'dark-mode', enabled: true });
      });
    };

    const { result } = await renderAppHook(() => useFeature('dark-mode'), {
      env,
      fusion,
      configure,
    });

    await vi.waitFor(() => expect(result.current.feature?.enabled).toBe(true));
  });

  it('lets an app-scoped flag override a framework-scoped flag with the same key', async () => {
    const fusion = await mockFramework<[AppModule, FeatureFlagModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
      enableFeatureFlagMock(configurator, (mock) => {
        mock.addFeature({ key: 'dark-mode', enabled: false });
      });
    });
    const configure: AppMockConfigureFn<[FeatureFlagModule]> = (configurator) => {
      enableFeatureFlagMock(configurator, (mock) => {
        mock.addFeature({ key: 'dark-mode', enabled: true });
      });
    };

    const { result } = await renderAppHook(() => useFeature('dark-mode'), {
      env,
      fusion,
      configure,
    });

    await vi.waitFor(() => expect(result.current.feature?.enabled).toBe(true));
  });

  it('exposes a framework-only flag through the merged stream when the app has not seeded it', async () => {
    const fusion = await mockFramework<[AppModule, FeatureFlagModule]>((configurator) => {
      enableAppManifestMock(configurator, env);
      enableFeatureFlagMock(configurator, (mock) => {
        mock.addFeature({ key: 'framework-only', enabled: true });
      });
    });
    const configure: AppMockConfigureFn<[FeatureFlagModule]> = (configurator) => {
      enableFeatureFlagMock(configurator);
    };

    const { result } = await renderAppHook(() => useFeature('framework-only'), {
      env,
      fusion,
      configure,
    });

    await vi.waitFor(() => expect(result.current.feature?.enabled).toBe(true));
  });

  it('inverts the current value when toggleFeature is called without an explicit value', async () => {
    const fusion = await mockFramework<[AppModule]>((configurator) =>
      enableAppManifestMock(configurator, env),
    );
    const configure: AppMockConfigureFn<[FeatureFlagModule]> = (configurator) => {
      enableFeatureFlagMock(configurator, (mock) => {
        mock.addFeature({ key: 'my-flag', enabled: false });
      });
    };

    const { result } = await renderAppHook(() => useFeature('my-flag'), { env, fusion, configure });
    await vi.waitFor(() => expect(result.current.feature?.enabled).toBe(false));

    act(() => {
      result.current.toggleFeature();
    });

    await vi.waitFor(() => expect(result.current.feature?.enabled).toBe(true));
  });
});
