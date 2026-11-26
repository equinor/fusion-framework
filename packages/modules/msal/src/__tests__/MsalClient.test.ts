import {
  CacheLookupPolicy,
  InteractionRequiredAuthError,
  PublicClientApplication,
  type AccountInfo,
  type AuthenticationResult,
  type RedirectRequest,
  type SilentRequest,
} from '@azure/msal-browser';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MsalClient, type MsalClientConfig } from '../MsalClient.js';

const account: AccountInfo = {
  homeAccountId: 'home-account-id',
  localAccountId: 'local-account-id',
  tenantId: 'tenant-id',
  environment: 'login.microsoftonline.com',
  username: 'user@example.com',
};
const baseRequest: RedirectRequest = { account, scopes: ['api://resource/.default'] };
const tokenResult = { account, accessToken: 'mock-access-token' } as AuthenticationResult;

let storageEntries: Map<string, string>;
let mockStorage: {
  getItem: ReturnType<typeof vi.fn>;
  setItem: ReturnType<typeof vi.fn>;
  removeItem: ReturnType<typeof vi.fn>;
};

/** Returns stored guard reservation keys (excluding the pending correlation pointer). */
function guardKeys(): string[] {
  return [...storageEntries.keys()].filter((key) => key.startsWith('fusion.msal.token-redirect.'));
}

/** Creates an `InteractionRequiredAuthError` representing an Entra `AADSTS65001` consent failure. */
function createInteractionError(code = 'invalid_grant'): InteractionRequiredAuthError {
  return new InteractionRequiredAuthError(
    code,
    'correlation-id',
    'AADSTS65001: The user or administrator has not consented',
    'consent_required',
  );
}

/** Creates a real `MsalClient` with network/browser MSAL methods stubbed. */
function createClient(
  clientId = 'client-id',
  overrides?: Partial<Omit<MsalClientConfig, 'auth'>>,
): MsalClient {
  const client = new MsalClient({
    auth: { clientId, authority: 'https://login.microsoftonline.com/tenant-id' },
    ...overrides,
  });
  vi.spyOn(client, 'acquireTokenSilent').mockRejectedValue(createInteractionError());
  vi.spyOn(client, 'acquireTokenRedirect').mockResolvedValue(undefined);
  vi.spyOn(client, 'acquireTokenPopup').mockResolvedValue(tokenResult);
  return client;
}

beforeEach(() => {
  storageEntries = new Map();
  mockStorage = {
    getItem: vi.fn((key: string) => storageEntries.get(key) ?? null),
    setItem: vi.fn((key: string, value: string) => {
      storageEntries.set(key, value);
    }),
    removeItem: vi.fn((key: string) => {
      storageEntries.delete(key);
    }),
  };
  vi.stubGlobal('sessionStorage', mockStorage);
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('MsalClient.acquireToken redirect loop guard', () => {
  it('allows one automatic redirect, then throws the original error across client recreations', async () => {
    const first = createClient();
    await first.acquireToken({ request: baseRequest });
    expect(first.acquireTokenRedirect).toHaveBeenCalledExactlyOnceWith(
      expect.objectContaining({ ...baseRequest, correlationId: expect.any(String) }),
    );
    expect(baseRequest.correlationId).toBeUndefined();

    const recreated = createClient();
    const error = createInteractionError();
    const errorLog = vi.spyOn(recreated.getLogger(), 'error');
    vi.mocked(recreated.acquireTokenSilent).mockRejectedValue(error);

    await expect(recreated.acquireToken({ request: baseRequest })).rejects.toBe(error);
    expect(recreated.acquireTokenRedirect).not.toHaveBeenCalled();
    expect(errorLog).toHaveBeenCalledWith(
      expect.stringContaining('Automatic token redirect already attempted'),
      expect.any(String),
    );

    const [storedKey] = guardKeys();
    expect(storedKey).toBeDefined();
    expect(storedKey).not.toContain(account.homeAccountId);
  });

  it('guards automatic no-account requests (silent: true) while preserving explicit silent: false', async () => {
    const noAccountRequest: RedirectRequest = { scopes: ['api://resource/.default'] };
    const first = createClient();
    await first.acquireToken({ request: noAccountRequest, silent: true });
    expect(first.acquireTokenRedirect).toHaveBeenCalledOnce();

    const recreated = createClient();
    await expect(
      recreated.acquireToken({ request: noAccountRequest, silent: true }),
    ).rejects.toBeInstanceOf(InteractionRequiredAuthError);
    expect(recreated.acquireTokenRedirect).not.toHaveBeenCalled();

    await recreated.acquireToken({ request: noAccountRequest, silent: false });
    expect(recreated.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('propagates non-interaction errors without redirecting or opening a popup', async () => {
    const client = createClient();
    const error = new Error('network unavailable');
    vi.mocked(client.acquireTokenSilent).mockRejectedValue(error);

    await expect(client.acquireToken({ request: baseRequest })).rejects.toBe(error);
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
    expect(client.acquireTokenPopup).not.toHaveBeenCalled();
  });

  it('normalizes scopes, authority slashes, and ignores telemetry fields', async () => {
    const client = createClient();
    await client.acquireToken({
      request: {
        ...baseRequest,
        authority: 'https://login.microsoftonline.com/tenant-id///',
        scopes: ['B', 'A', 'A'],
        correlationId: 'corr-1',
        state: 'state-1',
      },
    });

    await expect(
      client.acquireToken({
        request: {
          ...baseRequest,
          authority: 'https://LOGIN.microsoftonline.com/tenant-id',
          scopes: ['a', 'b'],
          correlationId: 'corr-2',
          state: 'state-2',
        },
      }),
    ).rejects.toBeInstanceOf(InteractionRequiredAuthError);
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it.each([
    { scopes: ['api://other/.default'] },
    { account: { ...account, homeAccountId: 'other-home' } },
    { account: { ...account, tenantId: 'other-tenant' } },
    { authority: 'https://login.microsoftonline.com/other-tenant' },
    { claims: '{"access_token":{"acrs":{"essential":true}}}' },
    { extraScopesToConsent: ['User.Read'] },
  ])('isolates distinct authorization requests: %j', async (override) => {
    const client = createClient();
    await client.acquireToken({ request: baseRequest });
    await client.acquireToken({ request: { ...baseRequest, ...override } });
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(2);
  });

  it('isolates clients and logs concurrent same-request duplicates below error level', async () => {
    const first = createClient('client-a');
    const second = createClient('client-a');
    const firstErrorLog = vi.spyOn(first.getLogger(), 'error');
    const secondErrorLog = vi.spyOn(second.getLogger(), 'error');
    const secondWarnLog = vi.spyOn(second.getLogger(), 'warning');

    const outcomes = await Promise.allSettled([
      first.acquireToken({ request: baseRequest }),
      second.acquireToken({ request: baseRequest }),
    ]);

    expect(outcomes.map((o) => o.status).sort()).toEqual(['fulfilled', 'rejected']);
    expect(
      vi.mocked(first.acquireTokenRedirect).mock.calls.length +
        vi.mocked(second.acquireTokenRedirect).mock.calls.length,
    ).toBe(1);
    expect(firstErrorLog).not.toHaveBeenCalled();
    expect(secondErrorLog).not.toHaveBeenCalled();
    expect(secondWarnLog).toHaveBeenCalledWith(
      expect.stringContaining('already in progress'),
      expect.any(String),
    );

    const otherClient = createClient('client-b');
    await otherClient.acquireToken({ request: baseRequest });
    expect(otherClient.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it('isolates forceRefresh and cacheLookupPolicy reservations from ordinary cached silent hits', async () => {
    const client = createClient('client-id', {
      cacheLookupPolicy: CacheLookupPolicy.AccessTokenAndRefreshToken,
    });
    const forceRefreshRequest = { ...baseRequest, forceRefresh: true } as RedirectRequest &
      SilentRequest;
    const refreshOnlyRequest = {
      ...baseRequest,
      cacheLookupPolicy: CacheLookupPolicy.RefreshToken,
    } as RedirectRequest & SilentRequest;

    await client.acquireToken({ request: forceRefreshRequest });
    await client.acquireToken({ request: refreshOnlyRequest });
    expect(guardKeys()).toHaveLength(2);

    // Ordinary cached hit uses default policy and must not clear refresh-only reservations.
    vi.mocked(client.acquireTokenSilent).mockResolvedValueOnce(tokenResult);
    await expect(client.acquireToken({ request: baseRequest })).resolves.toBe(tokenResult);
    expect(guardKeys()).toHaveLength(2);

    await expect(client.acquireToken({ request: forceRefreshRequest })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    await expect(client.acquireToken({ request: refreshOnlyRequest })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(2);
  });

  it('clears only the matching guard on silent success and correlated handleRedirectPromise token', async () => {
    const client = createClient();
    const otherRequest: RedirectRequest = { ...baseRequest, scopes: ['api://other/.default'] };

    await client.acquireToken({ request: baseRequest });
    await client.acquireToken({ request: otherRequest });
    const otherCorrelationId = vi.mocked(client.acquireTokenRedirect).mock.calls[1][0]
      .correlationId as string;
    expect(guardKeys()).toHaveLength(2);

    // Null, empty-token, error, and unrelated login responses must retain both guards.
    const superHandleRedirect = vi.spyOn(
      PublicClientApplication.prototype,
      'handleRedirectPromise',
    );
    superHandleRedirect.mockResolvedValueOnce(null);
    await expect(client.handleRedirectPromise()).resolves.toBeNull();
    superHandleRedirect.mockResolvedValueOnce({
      ...tokenResult,
      accessToken: '',
      correlationId: otherCorrelationId,
    });
    await client.handleRedirectPromise();
    superHandleRedirect.mockResolvedValueOnce({
      ...tokenResult,
      correlationId: 'unrelated-login-correlation-id',
    });
    await client.handleRedirectPromise();
    superHandleRedirect.mockRejectedValueOnce(createInteractionError());
    await expect(client.handleRedirectPromise()).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(guardKeys()).toHaveLength(2);

    // Correlated redirect token clears only otherRequest, keeping baseRequest guarded.
    superHandleRedirect.mockResolvedValueOnce({
      ...tokenResult,
      correlationId: otherCorrelationId,
    });
    await expect(client.handleRedirectPromise()).resolves.toMatchObject({
      accessToken: tokenResult.accessToken,
      correlationId: otherCorrelationId,
    });
    expect(guardKeys()).toHaveLength(1);

    await expect(client.acquireToken({ request: baseRequest })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    await client.acquireToken({ request: otherRequest });
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(3);

    // Silent success clears baseRequest cleanly.
    vi.mocked(client.acquireTokenSilent).mockResolvedValueOnce(tokenResult);
    await expect(client.acquireToken({ request: baseRequest })).resolves.toBe(tokenResult);
    expect(guardKeys()).toHaveLength(1);
  });

  it('preserves popup retries, clears guard on popup success, and keeps it on popup error', async () => {
    const client = createClient();
    await client.acquireToken({ request: baseRequest });

    const popupError = new Error('popup cancelled');
    vi.mocked(client.acquireTokenPopup).mockRejectedValueOnce(popupError);
    await expect(client.acquireToken({ request: baseRequest, behavior: 'popup' })).rejects.toBe(
      popupError,
    );
    expect(guardKeys()).toHaveLength(1);

    await expect(client.acquireToken({ request: baseRequest, behavior: 'popup' })).resolves.toBe(
      tokenResult,
    );
    expect(guardKeys()).toHaveLength(0);
  });

  it('allows explicit silent:false retries, direct no-account calls, and releases guard on redirect failure', async () => {
    const client = createClient();
    const redirectError = new Error('redirect failed');
    vi.mocked(client.acquireTokenRedirect).mockRejectedValueOnce(redirectError);

    await expect(client.acquireToken({ request: baseRequest })).rejects.toBe(redirectError);
    expect(storageEntries.size).toBe(0);

    await client.acquireToken({ request: baseRequest });
    await client.acquireToken({ request: baseRequest, silent: false });
    await client.acquireToken({ request: { scopes: baseRequest.scopes } });
    expect(client.acquireTokenRedirect).toHaveBeenCalledTimes(4);
  });
});

describe('MsalClient.acquireToken storage resilience', () => {
  it('falls back to in-memory tracking when sessionStorage is absent', async () => {
    vi.stubGlobal('sessionStorage', undefined);
    const client = createClient();

    await client.acquireToken({ request: baseRequest });
    await expect(client.acquireToken({ request: baseRequest })).rejects.toBeInstanceOf(
      InteractionRequiredAuthError,
    );
    expect(client.acquireTokenRedirect).toHaveBeenCalledOnce();
  });

  it.each(['getItem', 'setItem'] as const)(
    'skips automatic redirect and throws original MSAL error when sessionStorage.%s throws',
    async (method) => {
      const client = createClient();
      const error = createInteractionError();
      vi.mocked(client.acquireTokenSilent).mockRejectedValue(error);
      mockStorage[method].mockImplementation(() => {
        throw new Error('storage denied');
      });

      await expect(client.acquireToken({ request: baseRequest })).rejects.toBe(error);
      expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
    },
  );

  it('skips automatic redirect when sessionStorage getter throws', async () => {
    const client = createClient();
    const error = createInteractionError();
    vi.mocked(client.acquireTokenSilent).mockRejectedValue(error);
    vi.spyOn(globalThis, 'sessionStorage', 'get').mockImplementation(() => {
      throw new Error('storage access denied');
    });

    await expect(client.acquireToken({ request: baseRequest })).rejects.toBe(error);
    expect(client.acquireTokenRedirect).not.toHaveBeenCalled();
  });

  it('never discards a valid token or masks a redirect error when removeItem throws', async () => {
    const client = createClient();
    mockStorage.removeItem.mockImplementation(() => {
      throw new Error('storage denied');
    });

    vi.mocked(client.acquireTokenSilent).mockResolvedValueOnce(tokenResult);
    await expect(client.acquireToken({ request: baseRequest })).resolves.toBe(tokenResult);

    const redirectError = new Error('redirect failed');
    vi.mocked(client.acquireTokenRedirect).mockRejectedValueOnce(redirectError);
    await expect(client.acquireToken({ request: baseRequest })).rejects.toBe(redirectError);
  });
});
