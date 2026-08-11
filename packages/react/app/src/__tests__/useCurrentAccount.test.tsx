import { describe, expect, it } from 'vitest';

import { useCurrentAccount } from '../msal/useCurrentAccount';
import { renderAppHook } from '../testing/render-app-hook';

describe('useCurrentAccount', () => {
  it('returns the default mock user signed in by the app scope’s auth module', async () => {
    const { result } = await renderAppHook(() => useCurrentAccount());

    expect(result.current).toMatchObject({
      name: 'Test User',
      username: 'test.user@equinor.com',
    });
  });

  it('returns the account configured through the msal mock builder', async () => {
    const { result } = await renderAppHook(() => useCurrentAccount(), {
      configure: (configurator) =>
        configurator.msal.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' }),
    });

    expect(result.current).toMatchObject({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
  });

  it('returns undefined when no account is signed in', async () => {
    const { result } = await renderAppHook(() => useCurrentAccount(), {
      configure: (configurator) => configurator.msal.setAccount(null),
    });

    expect(result.current).toBeUndefined();
  });
});
