import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockFramework } from '@equinor/fusion-framework/mock';

import { useAccessToken } from '../msal/useAccessToken';
import { renderAppHook } from '../testing/render-app-hook';

describe('useAccessToken', () => {
  it('resolves an access token from the app scope’s real, mock-backed auth module', async () => {
    // `renderAppHook` runs the real msal module against an in-process mock client,
    // so `auth` behaves exactly as it would with a signed-in user in production.
    const { result, unmount } = await renderAppHook(() =>
      useAccessToken({ scopes: ['User.Read'] }),
    );

    expect(result.current.pending).toBe(true);
    expect(result.current.token).toBeUndefined();

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.error).toBeNull();
    // a structurally valid JWT has three dot-separated segments
    expect(result.current.token?.split('.')).toHaveLength(3);

    // unmount before the next test's environment tears down, so no acquisition
    // effect can flush a state update against an already-destroyed `window`
    unmount();
  });

  it('surfaces an acquisition error instead of throwing', async () => {
    const fusion = await mockFramework();
    // persistent, not `-Once`: the app module hoists via a version-compat proxy that
    // may call through before the hook's own effect does, consuming a one-shot mock
    vi.spyOn(fusion.modules.auth, 'acquireToken').mockRejectedValue(
      new Error('acquisition failed'),
    );

    const { result, unmount } = await renderAppHook(
      () => useAccessToken({ scopes: ['User.Read'] }),
      {
        fusion,
      },
    );

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);

    unmount();
  });
});
