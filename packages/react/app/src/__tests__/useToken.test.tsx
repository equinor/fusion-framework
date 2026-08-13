import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';

import { useToken } from '../msal/useToken';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

describe('useToken', () => {
  it('resolves a full AuthenticationResult from the app scope’s real, mock-backed auth module', async () => {
    const { result, unmount } = await renderAppHook(() => useToken({ scopes: ['User.Read'] }));

    // `renderAppHook` awaits the render, and the mock resolves near-instantly,
    // so the pending state may have already settled by the time we can observe it
    await vi.waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.error).toBeNull();
    expect(result.current.token?.scopes).toEqual(['User.Read']);
    // a structurally valid JWT has three dot-separated segments
    expect(result.current.token?.accessToken.split('.')).toHaveLength(3);
    expect(result.current.token?.account).toMatchObject({ username: 'test.user@equinor.com' });

    // unmount before the next test's environment tears down, so no acquisition
    // effect can flush a state update against an already-destroyed `window`
    await unmount();
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

    await vi.waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.token).toBeUndefined();
    expect(result.current.error).toBeInstanceOf(Error);

    await unmount();
  });

  it('only re-acquires the token when the scopes\u2019 contents change, not on every re-render', async () => {
    const fusion = await mockFramework();
    const acquireToken = vi.spyOn(fusion.modules.auth, 'acquireToken');

    const { result, rerender, unmount } = await renderAppHook(
      (props) => useToken(props),
      { initialProps: { scopes: ['User.Read'] }, fusion },
    );

    await vi.waitFor(() => expect(result.current.pending).toBe(false));
    expect(acquireToken).toHaveBeenCalledTimes(1);

    // a fresh array literal with the same contents must not trigger a re-acquisition
    await rerender({ scopes: ['User.Read'] });
    await vi.waitFor(() => expect(result.current.pending).toBe(false));
    expect(acquireToken).toHaveBeenCalledTimes(1);

    // changed scope contents must trigger a second acquisition
    await rerender({ scopes: ['User.Read', 'Mail.Read'] });
    await vi.waitFor(() => expect(result.current.pending).toBe(false));
    expect(acquireToken).toHaveBeenCalledTimes(2);

    await unmount();
  });
});
