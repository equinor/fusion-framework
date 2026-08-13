import { describe, expect, vi } from 'vitest';
import type { AppMockConfigureFn } from '@equinor/fusion-framework-app/mock';
import { test } from '@equinor/fusion-framework-vitest-plugin-react-app/test';

import { App } from './App';

/**
 * Composes the cookbook's real `configure` with a named mock account, instead of
 * the msal mock's default "Test User" — signed in before the msal provider
 * initializes, so the provider's own start-up path observes it.
 */
const withMockAccount =
  (account: { name: string; username?: string }): AppMockConfigureFn =>
  (configurator) => {
    configurator.msal.setAccount(account);
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

describe('with a configured account', () => {
  test.override('configure', { injected: true }, () =>
    withMockAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' }),
  );

  test('displays the account instead of the msal mock default', async ({ render }) => {
    const { getByRole, unmount } = await render(<App />);

    const currentUserPre = getByRole('heading', { name: /current user/i }).element()
      .nextElementSibling as HTMLElement;
    await vi.waitFor(() => expect(currentUserPre.textContent).toContain('Ada Lovelace'));
    expect(currentUserPre.textContent).not.toContain('Test User');

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
