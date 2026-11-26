import { webcrypto } from 'node:crypto';
import {
  InteractionRequiredAuthError,
  type AccountInfo,
  type AuthenticationResult,
  type RedirectRequest,
} from '@azure/msal-browser';
import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { MsalClient } from '../MsalClient.js';

const account: AccountInfo = {
  homeAccountId: 'home',
  localAccountId: 'local',
  tenantId: 'tenant',
  environment: 'login.microsoftonline.com',
  username: 'user@example.com',
};
const request: RedirectRequest = { account, scopes: ['api://resource/Read'] };
const result = { account, accessToken: 'token' } as AuthenticationResult;
let entries: Map<string, string>;
let storage: {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
};

/** Creates a real MSAL client with only external authentication operations stubbed. */
function createClient(clientId = 'client'): MsalClient {
  const client = new MsalClient({
    auth: { clientId, authority: 'https://login.microsoftonline.com/tenant' },
  });
  vi.spyOn(client, 'acquireTokenSilent').mockRejectedValue(interactionError());
  vi.spyOn(client, 'acquireTokenRedirect').mockResolvedValue(undefined);
  vi.spyOn(client, 'acquireTokenPopup').mockResolvedValue(result);
  return client;
}

/** Creates the MSAL error produced for invalid_grant with consent_required/AADSTS65001. */
function interactionError(): InteractionRequiredAuthError {
  return new InteractionRequiredAuthError(
    'invalid_grant',
    'correlation',
    'AADSTS65001: consent required',
    'consent_required',
  );
}

beforeEach(() => {
  entries = new Map();
  storage = {
    getItem: vi.fn((key: string) => entries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      entries.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      entries.delete(key);
    }),
  };
  vi.stubGlobal('sessionStorage', storage);
  vi.stubGlobal('crypto', webcrypto);
});
afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MsalClient automatic token fallback', () => {
  it('allows consent once, then propagates the original error across client/page recreation', async () => {
    const first = createClient();
    await first.acquireToken({ request });
    expect(first.acquireTokenRedirect).toHaveBeenCalledExactlyOnceWith(request);
    const recreated = createClient();
    const error = interactionError();
    vi.mocked(recreated.acquireTokenSilent).mockRejectedValue(error);
    await expect(recreated.acquireToken({ request })).rejects.toBe(error);
    expect(recreated.acquireTokenRedirect).not.toHaveBeenCalled();
    expect([...entries.keys()][0]).not.toContain(account.homeAccountId);
  });

  it.each(['login_required', 'interaction_required'])(
    'preserves legitimate %s recovery',
    async (code) => {
      const client = createClient();
      vi.mocked(client.acquireTokenSilent).mockRejectedValue(
        new InteractionRequiredAuthError(code, 'correlation'),
      );
      await client.acquireToken({ request });
      expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
    },
  );

  it.each([
    new Error('network unavailable'),
    new Error('invalid_scope'),
    new Error('invalid_client'),
  ])('does not redirect on a non-interaction error: %s', async (error) => {
    const client = createClient();
    vi.mocked(client.acquireTokenSilent).mockRejectedValue(error);
    await expect(client.acquireToken({ request })).rejects.toBe(error);
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
    expect(client.acquireTokenPopup).not.toHaveBeenCalled();
  });

  it('deduplicates scope casing, order and telemetry changes', async () => {
    const client = createClient();
    await client.acquireToken({
      request: { ...request, scopes: ['B', 'A', 'A'], correlationId: 'first', state: 'first' },
    });
    await expect(
      client.acquireToken({
        request: { ...request, scopes: ['a', 'b'], correlationId: 'next', state: 'next' },
      }),
    ).rejects.toBeInstanceOf(InteractionRequiredAuthError);
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it.each([
    { scopes: ['different'] },
    { account: { ...account, homeAccountId: 'other' } },
    { account: { ...account, tenantId: 'other' } },
    { authority: 'https://login.microsoftonline.com/other' },
    { claims: '{"access_token":{"test":null}}' },
    { resource: 'other-resource' },
    { resourceRequestUri: 'https://other.example.com' },
    { extraQueryParameters: { domain_hint: 'other' } },
  ])('does not block a distinct authorization identity: %j', async (change) => {
    const client = createClient();
    await client.acquireToken({ request });
    await client.acquireToken({ request: { ...request, ...change } });
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(2);
  });

  it('isolates different application registrations', async () => {
    await createClient().acquireToken({ request });
    const other = createClient('other-client');
    await other.acquireToken({ request });
    expect(other.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('prevents concurrent same-request redirects across clients', async () => {
    const first = createClient();
    const second = createClient();
    const outcomes = await Promise.allSettled([
      first.acquireToken({ request }),
      second.acquireToken({ request }),
    ]);
    expect(outcomes.map((outcome) => outcome.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(
      vi.mocked(first.acquireTokenRedirect).mock.calls.length +
        vi.mocked(second.acquireTokenRedirect).mock.calls.length,
    ).toBe(1);
  });

  it('clears only the successful silent request, allowing later session recovery', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    const otherRequest = { ...request, scopes: ['other'] };
    await client.acquireToken({ request: otherRequest });
    vi.mocked(client.acquireTokenSilent).mockResolvedValueOnce(result);
    await expect(client.acquireToken({ request })).resolves.toBe(result);
    expect(entries.size).toBe(1);
    await client.acquireToken({ request });
    await expect(client.acquireToken({ request: otherRequest })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(3);
  });

  it('preserves repeatable popup consent and clears a prior redirect on success', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    await expect(client.acquireToken({ request, behavior: 'popup' })).resolves.toBe(result);
    await expect(client.acquireToken({ request, behavior: 'popup' })).resolves.toBe(result);
    expect(client.acquireTokenPopup).toHaveBeenCalledTimes(2);
    expect(entries.size).toBe(0);
  });

  it('allows explicit user-driven redirects without resetting the automatic guard', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    await client.acquireToken({ request, silent: false });
    await expect(client.acquireToken({ request })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(2);
  });

  it('preserves popup errors without clearing the guard', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    const error = new Error('popup cancelled');
    vi.mocked(client.acquireTokenPopup).mockRejectedValue(error);
    await expect(client.acquireToken({ request, behavior: 'popup' })).rejects.toBe(error);
    expect(entries.size).toBe(1);
  });

  it('clears a failed redirect and propagates its original error', async () => {
    const client = createClient();
    const error = new Error('redirect failed');
    vi.mocked(client.acquireTokenRedirect).mockRejectedValueOnce(error);
    await expect(client.acquireToken({ request })).rejects.toBe(error);
    expect(entries.size).toBe(0);
    await client.acquireToken({ request });
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(2);
  });

  it.each(['getItem', 'setItem'] as const)('fails closed when storage %s fails', async (method) => {
    const client = createClient();
    const cause = new Error('storage denied');
    storage[method].mockImplementation(() => {
      throw cause;
    });
    await expect(client.acquireToken({ request })).rejects.toMatchObject({
      message: expect.stringContaining('Cannot safely start'),
      cause,
    });
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
  });

  it('surfaces cleanup failure instead of starting another redirect', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    vi.mocked(client.acquireTokenSilent).mockResolvedValue(result);
    const cause = new Error('storage denied');
    storage.removeItem.mockImplementation(() => {
      throw cause;
    });
    await expect(client.acquireToken({ request })).rejects.toMatchObject({
      message: 'Cannot clear MSAL token redirect guard storage.',
      cause,
    });
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('keeps the guard even after a successful redirect result', async () => {
    const client = createClient();
    await client.acquireToken({ request });
    vi.spyOn(client, 'handleRedirectPromise').mockResolvedValue(result);
    await client.handleRedirectPromise();
    await expect(client.acquireToken({ request })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('canonicalizes custom parameter insertion order', async () => {
    const client = createClient();
    await client.acquireToken({
      request: { ...request, extraQueryParameters: { a: '1', b: '2' } },
    });
    await expect(
      client.acquireToken({ request: { ...request, extraQueryParameters: { b: '2', a: '1' } } }),
    ).rejects.toBeInstanceOf(InteractionRequiredAuthError);
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('fails closed when sessionStorage access itself is denied', async () => {
    const client = createClient();
    const cause = new Error('storage access denied');
    vi.spyOn(globalThis, 'sessionStorage', 'get').mockImplementation(() => {
      throw cause;
    });
    await expect(client.acquireToken({ request })).rejects.toMatchObject({ cause });
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
  });

  it('fails closed when request hashing fails', async () => {
    const client = createClient();
    const cause = new Error('crypto unavailable');
    vi.stubGlobal('crypto', { subtle: { digest: vi.fn().mockRejectedValue(cause) } });
    await expect(client.acquireToken({ request })).rejects.toMatchObject({ cause });
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
  });

  it('retains the no-account interactive flow', async () => {
    const client = createClient();
    const noAccount = { scopes: request.scopes };
    await client.acquireToken({ request: noAccount });
    expect(client.acquireTokenSilent).not.toHaveBeenCalled();
    expect(client.acquireTokenRedirect).toHaveBeenCalledExactlyOnceWith(noAccount);
  });

  it('reports both redirect and cleanup failures', async () => {
    const client = createClient();
    const error = new Error('redirect failed');
    const cause = new Error('cleanup failed');
    vi.mocked(client.acquireTokenRedirect).mockRejectedValue(error);
    storage.removeItem.mockImplementation(() => {
      throw cause;
    });
    await expect(client.acquireToken({ request })).rejects.toMatchObject({
      errors: [error, expect.objectContaining({ cause })],
    });
  });
});
