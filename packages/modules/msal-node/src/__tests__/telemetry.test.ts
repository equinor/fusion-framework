import { describe, expect, it, vi } from 'vitest';
import { PublicClientApplication } from '@azure/msal-node';
import type { ITelemetryProvider, TelemetryItem } from '@equinor/fusion-framework-module-telemetry';

import { AuthProvider } from '../AuthProvider.js';
import { AuthTokenProvider } from '../AuthTokenProvider.js';
import { connectAuthTelemetry } from '../connect-auth-telemetry.js';
import { module } from '../module.js';

const sentinel = 'privacy-sentinel-0d77';

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

/** Runs the module's post-initialization hook against a given provider instance. */
const postInitialize = (instance: unknown, telemetry: ITelemetryProvider | undefined) =>
  (module.postInitialize as NonNullable<typeof module.postInitialize>)({
    instance: instance as Parameters<NonNullable<typeof module.postInitialize>>[0]['instance'],
    modules: { telemetry } as unknown as Parameters<
      NonNullable<typeof module.postInitialize>
    >[0]['modules'],
  });

describe('msal-node operational telemetry', () => {
  it('records token, login and logout outcomes without tokens, scopes or accounts', async () => {
    const original = new Error(`device code ${sentinel}`);
    const provider = {
      acquireAccessToken: vi.fn(async () => `token-${sentinel}`),
      login: vi.fn(async () => ({ account: { username: sentinel } })),
      logout: vi.fn().mockRejectedValue(original),
    };
    const { telemetry, items } = createTelemetry();
    connectAuthTelemetry(provider, telemetry);

    await expect(
      provider.acquireAccessToken({ request: { scopes: [`api://${sentinel}/.default`] } }),
    ).resolves.toBe(`token-${sentinel}`);
    await expect(provider.login({ request: { scopes: ['a'] } })).resolves.toMatchObject({
      account: { username: sentinel },
    });
    await expect(provider.logout()).rejects.toBe(original);

    expect(names(items)).toEqual([
      'fusion.msal-node.acquire-token.duration:success',
      'fusion.msal-node.login.duration:success',
      'fusion.msal-node.logout.duration:failure',
      'fusion.msal-node.logout.failure:failure',
    ]);
    expect(JSON.stringify(items)).not.toContain(sentinel);
  });

  it('leaves providers untouched without telemetry and never observes a static token', async () => {
    const provider = new AuthProvider(
      new PublicClientApplication({ auth: { clientId: '00000000-0000-0000-0000-000000000000' } }),
    );
    const acquireAccessToken = provider.acquireAccessToken;
    await postInitialize(provider, undefined);
    expect(provider.acquireAccessToken).toBe(acquireAccessToken);

    const { telemetry, items } = createTelemetry();
    const tokenOnly = new AuthTokenProvider(`token-${sentinel}`);
    await postInitialize(tokenOnly, telemetry);
    await expect(tokenOnly.acquireAccessToken({ request: { scopes: [] } })).resolves.toBe(
      `token-${sentinel}`,
    );
    expect(items).toHaveLength(0);

    await postInitialize(provider, telemetry);
    expect(provider.acquireAccessToken).not.toBe(acquireAccessToken);
  });
});
