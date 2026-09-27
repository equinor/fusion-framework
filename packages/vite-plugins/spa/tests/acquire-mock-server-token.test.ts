import { describe, expect, it, vi } from 'vitest';

import { acquireMockServerToken } from '../src/html/acquire-mock-server-token.js';

describe('acquireMockServerToken', () => {
  it('requests the exact scopes with browser-session credentials', async () => {
    const request = vi.fn(async () =>
      Response.json({ status: 'issued', token: 'mock-access-token' }),
    );

    await expect(
      acquireMockServerToken('http://localhost:4010', ['User.Read'], request),
    ).resolves.toBe('mock-access-token');

    expect(request).toHaveBeenCalledWith(new URL('http://localhost:4010/@fusion-mock/auth/token'), {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scopes: ['User.Read'] }),
    });
  });

  it('returns null when the session has no selected user', async () => {
    const request = vi.fn(async () => Response.json({ status: 'missing' }));

    await expect(acquireMockServerToken('http://localhost:4010', [], request)).resolves.toBeNull();
  });

  it('rejects failed and unsupported responses', async () => {
    const failedRequest = vi.fn(async () => new Response(null, { status: 500 }));
    const invalidRequest = vi.fn(async () => Response.json({ status: 'unexpected' }));

    await expect(
      acquireMockServerToken('http://localhost:4010', [], failedRequest),
    ).rejects.toThrow('status 500');
    await expect(
      acquireMockServerToken('http://localhost:4010', [], invalidRequest),
    ).rejects.toThrow('unsupported status');
  });
});
