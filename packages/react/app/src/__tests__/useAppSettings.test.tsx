import { act, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';

import { useAppSettings } from '../settings/useAppSettings';
import { renderAppHook } from '../testing/render-app-hook';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

/**
 * Boots a parent framework whose `apps` client serves per-user settings from an
 * in-memory store, so `useAppSettings` exercises the real fetch/update round-trip
 * instead of a stubbed provider.
 *
 * @param initial - The settings the store starts seeded with.
 * @param putResponse - Overrides the response a PUT request resolves to, to simulate a failed update.
 */
const mockSettingsFusion = async (
  initial: Record<string, unknown> = {},
  putResponse?: () => Response,
) => {
  const store: Record<string, unknown> = { ...initial };
  const fusion = await mockFramework<[AppModule]>((configurator) => {
    configurator.http.addMiddleware(
      createRouterMiddleware('https://apps.fusion.test', (router) => {
        router.get('/persons/me/apps/:appKey/settings', () => Response.json(store));
        router.put('/persons/me/apps/:appKey/settings', async ({ request }) => {
          // a caller-supplied response simulates a failed persistence request
          if (putResponse) return putResponse();
          // the PUT body replaces the seeded keys it targets, leaving the rest of the store untouched
          Object.assign(store, await request.json());
          return Response.json(store);
        });
      }),
    );
    enableAppManifestMock(configurator, env);
  });
  fusion.modules.app.setCurrentApp(env.manifest.appKey);
  return fusion;
};

interface TestSettings extends Record<string, unknown> {
  theme: string;
  layout: string;
}

describe('useAppSettings', () => {
  it('resolves the full persisted settings object', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark', layout: 'grid' });

    const { result } = await renderAppHook(() => useAppSettings<TestSettings>(), { env, fusion });

    await waitFor(() => expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'grid' }));
  });

  it('falls back to the default value until the persisted settings resolve', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark', layout: 'grid' });

    const { result } = await renderAppHook(
      () => useAppSettings<TestSettings>({ theme: 'light', layout: 'list' }),
      { env, fusion },
    );

    expect(result.current[0]).toMatchObject({ theme: 'light', layout: 'list' });
    await waitFor(() =>
      expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'grid' }),
    );
  });

  it('persists an updated settings object and notifies onUpdated', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark', layout: 'grid' });
    const onUpdated = vi.fn();

    const { result } = await renderAppHook(
      () => useAppSettings<TestSettings>(undefined, { onUpdated }),
      { env, fusion },
    );

    await waitFor(() => expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'grid' }));

    act(() => {
      result.current[1]({ theme: 'light', layout: 'grid' });
    });

    await waitFor(() =>
      expect(result.current[0]).toMatchObject({ theme: 'light', layout: 'grid' }),
    );
    await waitFor(() => expect(onUpdated).toHaveBeenCalled());
  });

  it('resolves the next settings object from the previous one when given an updater function', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark', layout: 'grid' });

    const { result } = await renderAppHook(() => useAppSettings<TestSettings>(), { env, fusion });

    await waitFor(() => expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'grid' }));

    act(() => {
      // `current` is typed as possibly undefined even though it's already resolved by this point
      result.current[1]((current) => ({ theme: current?.theme ?? 'dark', layout: 'list' }));
    });

    await waitFor(() =>
      expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'list' }),
    );
  });

  it('surfaces a persistence failure through onError instead of throwing', async () => {
    const fusion = await mockSettingsFusion(
      { theme: 'dark', layout: 'grid' },
      () => new Response(null, { status: 500 }),
    );
    const onError = vi.fn();

    const { result } = await renderAppHook(
      () => useAppSettings<TestSettings>(undefined, { onError }),
      { env, fusion },
    );

    await waitFor(() => expect(result.current[0]).toMatchObject({ theme: 'dark', layout: 'grid' }));

    act(() => {
      result.current[1]({ theme: 'light', layout: 'grid' });
    });

    await waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(Error)));
  });
});
