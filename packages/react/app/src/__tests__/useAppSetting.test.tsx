import { act } from 'react';
import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import { enableAppManifestMock } from '@equinor/fusion-framework-app/mock';
import type { AppModule } from '@equinor/fusion-framework-module-app';
import { createRouterMiddleware } from '@equinor/fusion-framework-module-http/mock';

import { useAppSetting } from '../settings/useAppSetting';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

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
 * in-memory store, so `useAppSetting` exercises the real fetch/update round-trip
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

describe('useAppSetting', () => {
  it('resolves the persisted value for a single setting key', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark' });

    const { result } = await renderAppHook(
      () => useAppSetting<{ theme: string }, 'theme'>('theme'),
      { env, fusion },
    );

    await vi.waitFor(() => expect(result.current[0]).toBe('dark'));
  });

  it('falls back to the default value until the persisted settings resolve', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark' });

    const { result } = await renderAppHook(
      () => useAppSetting<{ theme: string }, 'theme'>('theme', 'light'),
      { env, fusion },
    );

    expect(result.current[0]).toBe('light');
    await vi.waitFor(() => expect(result.current[0]).toBe('dark'));
  });

  it('persists an updated value and notifies onUpdated', async () => {
    const fusion = await mockSettingsFusion({ theme: 'dark' });
    const onUpdated = vi.fn();

    const { result } = await renderAppHook(
      () => useAppSetting<{ theme: string }, 'theme'>('theme', undefined, { onUpdated }),
      { env, fusion },
    );

    await vi.waitFor(() => expect(result.current[0]).toBe('dark'));

    act(() => {
      result.current[1]('light');
    });

    await vi.waitFor(() => expect(result.current[0]).toBe('light'));
    await vi.waitFor(() => expect(onUpdated).toHaveBeenCalled());
  });

  it('resolves the next value from the previous one when given an updater function', async () => {
    const fusion = await mockSettingsFusion({ count: 1 });

    const { result } = await renderAppHook(
      () => useAppSetting<{ count: number }, 'count'>('count'),
      { env, fusion },
    );

    await vi.waitFor(() => expect(result.current[0]).toBe(1));

    act(() => {
      result.current[1]((current) => (current ?? 0) + 1);
    });

    await vi.waitFor(() => expect(result.current[0]).toBe(2));
  });

  it('surfaces a persistence failure through onError instead of throwing', async () => {
    const fusion = await mockSettingsFusion(
      { theme: 'dark' },
      () => new Response(null, { status: 500 }),
    );
    const onError = vi.fn();

    const { result } = await renderAppHook(
      () => useAppSetting<{ theme: string }, 'theme'>('theme', undefined, { onError }),
      { env, fusion },
    );

    await vi.waitFor(() => expect(result.current[0]).toBe('dark'));

    act(() => {
      result.current[1]('light');
    });

    await vi.waitFor(() => expect(onError).toHaveBeenCalledWith(expect.any(Error)));
  });
});
