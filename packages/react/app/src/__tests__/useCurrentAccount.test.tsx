import { describe, expect, it, vi } from 'vitest';

import { createMockToken } from '@equinor/fusion-framework-module-msal/mock';

import { useAccessToken } from '../msal/useAccessToken';
import { useCurrentAccount } from '../msal/useCurrentAccount';
import { renderAppHook } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

describe('useCurrentAccount', () => {
  it('returns the default mock user signed in by the app scope’s auth module', async () => {
    const { result } = await renderAppHook(() => useCurrentAccount());

    expect(result.current).toMatchObject({
      name: 'Test User',
      username: 'test.user@equinor.com',
    });
  });

  it('returns the account derived from an acquired mock token', async () => {
    const { result } = await renderAppHook(
      () => ({
        account: useCurrentAccount(),
        token: useAccessToken({ scopes: ['User.Read'] }),
      }),
      {
        configure: (configurator) =>
          configurator.msal.setAcquireToken(({ clientId, scopes }) =>
            createMockToken({
              aud: clientId,
              scp: scopes.join(' '),
              name: 'Ada Lovelace',
              preferred_username: 'ada@equinor.com',
              oid: 'ada-lovelace',
            }),
          ),
      },
    );

    await vi.waitFor(() => expect(result.current.token.pending).toBe(false));
    expect(result.current.account).toMatchObject({
      name: 'Ada Lovelace',
      username: 'ada@equinor.com',
    });
  });
});
