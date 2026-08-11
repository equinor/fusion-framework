import { describe, expect, it, vi } from 'vitest';
import { waitFor } from '@testing-library/react';

import { mockFramework } from '@equinor/fusion-framework/mock';

import { useToken } from '../msal/useToken';
import { renderAppHook } from '../testing/render-app-hook';

describe('useToken', () => {
  it('resolves a full AuthenticationResult from the app scope’s real, mock-backed auth module', async () => {
    const { result, unmount } = await renderAppHook(() => useToken({ scopes: ['User.Read'] }));

    expect(result.current.pending).toBe(true);
    expect(result.current.token).toBeUndefined();

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.token?.scopes).toEqual(['User.Read']);
    // a structurally valid JWT has three dot-separated segments
    expect(result.current.token?.accessToken.split('.')).toHaveLength(3);
    expect(result.current.token?.account).toMatchObject({ username: 'test.user@equinor.com' });

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

    const { result, unmount } = await renderAppHook(() => useToken({ scopes: ['User.Read'] }), {
      fusion,
    });

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);

    unmount();
  });
});
