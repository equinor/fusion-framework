import { describe, expect, vi } from 'vitest';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import { createMockToken } from '@equinor/fusion-framework-module-msal/mock';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { App } from './App';

/**
 * Supplies a token whose claims define the mock account before the MSAL provider initializes.
 *
 * @param account - Identity claims used to create the token returned by the test runtime.
 * @returns App mock configuration that replaces the built-in "Test User" identity.
 */
const withMockTokenIdentity =
  (account: { userId: string; name: string; username?: string }): AppMockConfigureFn =>
  (configurator) => {
    configurator.msal.setAcquireToken(({ clientId, scopes }) =>
      createMockToken({
        aud: clientId,
        scp: scopes.join(' '),
        oid: account.userId,
        name: account.name,
        preferred_username: account.username,
      }),
    );
  };

// --- tests ---

test('renders the default signed-in mock user once the app configuration has initialized', async ({
  render,
}) => {
  const { getByRole, unmount } = await render(<App />);

  // scoped to the current-user <pre>: it's the only section rendered at first, but
  // scoping keeps the assertion meaningful once the token section mounts alongside it
  const currentUserPre = getByRole('heading', { name: /current user/i }).element()
    .nextElementSibling as HTMLElement;
  await vi.waitFor(() => expect(currentUserPre.textContent).toContain('Test User'));

  await unmount();
});

describe('with a configured token identity', () => {
  test.override('configureApp', { injected: true }, () =>
    withMockTokenIdentity({
      userId: 'ada-lovelace',
      name: 'Ada Lovelace',
      username: 'ada@equinor.com',
    }),
  );

  test('returns the configured identity with the acquired token', async ({ render }) => {
    const { getByRole, unmount } = await render(<App />);

    const tokenSection = getByRole('heading', { name: /token/i }).element()
      .parentElement as HTMLElement;
    const [, tokenResponseCode] = tokenSection.querySelectorAll('code');
    await vi.waitFor(() => expect(tokenResponseCode.textContent).toContain('Ada Lovelace'));
    expect(tokenResponseCode.textContent).toContain('ada-lovelace');

    await unmount();
  });
});

test('resolves and renders an access token for the portal service scopes', async ({ render }) => {
  const { getByRole, unmount } = await render(<App />);

  await expect.element(getByRole('heading', { name: /token/i })).toBeInTheDocument();

  // the access token <code> and the token-response <code><pre> are the two `code`
  // elements following the "Token" heading, in that order
  const tokenSection = getByRole('heading', { name: /token/i }).element()
    .parentElement as HTMLElement;
  const [accessTokenCode, tokenResponseCode] = tokenSection.querySelectorAll('code');

  await vi.waitFor(() => expect(accessTokenCode.textContent?.length).toBeGreaterThan(0));
  expect(tokenResponseCode.textContent).toContain('accessToken');

  await unmount();
});
