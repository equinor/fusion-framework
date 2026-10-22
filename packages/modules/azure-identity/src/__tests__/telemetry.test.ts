import { describe, expect, it, vi } from 'vitest';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

import { AuthProviderTokenOnly } from '../AuthProviderTokenOnly.js';
import { connectAuthTelemetry } from '../connect-auth-telemetry.js';
import { module } from '../module.js';

const sentinel = 'privacy-sentinel-9b31';

/** Telemetry double that keeps every record the provider would export. */
const createTelemetry = (): { telemetry: ITelemetryProvider; items: TelemetryItem[] } => {
  const items: TelemetryItem[] = [];
  const telemetry = {
    source: { source: 'cli', hostId: 'host-1' },
    track: (item: TelemetryItem) => items.push(item),
    trackEvent: (item: TelemetryItem) => items.push(item),
  } as unknown as ITelemetryProvider;
  return { telemetry, items };
};

const names = (items: TelemetryItem[]): string[] =>
  items.map((item) => `${item.name}:${item.diagnostic?.outcome}`);

/** Provider double whose `acquireAccessToken` delegates like the real providers. */
class FakeProvider {
  acquireToken = vi.fn(async () => ({ accessToken: `token-${sentinel}`, expiresOn: null }));
  login = vi.fn(async () => ({ username: sentinel, tenantId: sentinel }));
  logout = vi.fn(async () => undefined);
  async acquireAccessToken(options: { request: { scopes: string[] } }): Promise<string> {
    const result = await this.acquireToken(options);
    return result?.accessToken ?? '';
  }
}

describe('azure-identity operational telemetry', () => {
  it('counts each token acquisition once through acquireToken and records no identity', async () => {
    const provider = new FakeProvider();
    const { telemetry, items } = createTelemetry();
    connectAuthTelemetry(provider, telemetry);

    await expect(
      provider.acquireAccessToken({ request: { scopes: [`api://${sentinel}/.default`] } }),
    ).resolves.toBe(`token-${sentinel}`);
    await provider.acquireToken({ request: { scopes: ['a'] } });
    await provider.login({ request: { scopes: ['a'] } });
    await provider.logout();

    expect(names(items)).toEqual([
      'fusion.azure-identity.acquire-token.duration:success',
      'fusion.azure-identity.acquire-token.duration:success',
      'fusion.azure-identity.login.duration:success',
      'fusion.azure-identity.logout.duration:success',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('rethrows the original failure with one sanitized exception', async () => {
    const original = new Error(`credential ${sentinel}`);
    const provider = new FakeProvider();
    provider.acquireToken.mockRejectedValueOnce(original);
    const { telemetry, items } = createTelemetry();
    connectAuthTelemetry(provider, telemetry);

    await expect(provider.acquireAccessToken({ request: { scopes: ['a'] } })).rejects.toBe(
      original,
    );

    expect(names(items)).toEqual([
      'fusion.azure-identity.acquire-token.duration:failure',
      'fusion.azure-identity.acquire-token.failure:failure',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('never observes a static token provider', async () => {
    const { telemetry, items } = createTelemetry();
    const provider = new AuthProviderTokenOnly(`token-${sentinel}`);
    await (module.postInitialize as NonNullable<typeof module.postInitialize>)({
      instance: provider,
      modules: { telemetry } as unknown as Parameters<
        NonNullable<typeof module.postInitialize>
      >[0]['modules'],
    });
    await provider.acquireAccessToken({ request: { scopes: [] } });
    expect(items).toHaveLength(0);

    // Any other provider is instrumented, even though module providers share duck-typed instanceof.
    const other = new FakeProvider();
    const acquireToken = other.acquireToken;
    await (module.postInitialize as NonNullable<typeof module.postInitialize>)({
      instance: other as unknown as AuthProviderTokenOnly,
      modules: { telemetry } as unknown as Parameters<
        NonNullable<typeof module.postInitialize>
      >[0]['modules'],
    });
    expect(other.acquireToken).not.toBe(acquireToken);
  });
});
