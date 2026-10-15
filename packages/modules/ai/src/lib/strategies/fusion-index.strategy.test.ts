import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { IServiceDiscoveryProvider } from '@equinor/fusion-framework-module-service-discovery';

const { searchClientCtor } = vi.hoisted(() => ({ searchClientCtor: vi.fn() }));

vi.mock('../azure/FusionSearchClient.js', () => ({ FusionSearchClient: searchClientCtor }));
vi.mock('../azure/AzureVectorStore.js', () => ({ AzureVectorStore: vi.fn() }));

import { createFusionAiIndexStrategy } from './fusion-index.strategy.js';
import type { IEmbed } from '../types.js';

const createModules = (uri: string, defaultHeaders?: Record<string, string>) => {
  // Only resolveService is used by the strategy, so a partial provider is cast
  const serviceDiscovery = {
    resolveService: async () => ({ uri }),
  } as unknown as IServiceDiscoveryProvider;

  return { auth: { acquireAccessToken: vi.fn() }, serviceDiscovery, defaultHeaders };
};

/** Runs the policies registered on the last created search client against a fake request. */
const runPolicies = async (): Promise<Headers> => {
  const options = searchClientCtor.mock.calls.at(-1)?.[3];
  const request = { headers: new Headers() };
  // Only the header policy is of interest; the token policy needs real auth and is skipped
  for (const { policy } of options.additionalPolicies) {
    // Match by name so other policies on the client are ignored
    if (policy.name === 'FusionDefaultHeaders') {
      await policy.sendRequest(request, async () => ({}));
    }
  }
  return request.headers;
};

beforeEach(() => searchClientCtor.mockClear());

describe('createFusionAiIndexStrategy default headers', () => {
  it('adds a policy that sets the headers on https endpoints', async () => {
    const strategy = await createFusionAiIndexStrategy(
      createModules('https://ai.example.com', { 'X-Fusion-CLI-Name': 'my-tool' }),
    );
    strategy.createStore({} as IEmbed, 'index');

    expect((await runPolicies()).get('X-Fusion-CLI-Name')).toBe('my-tool');
  });

  it('adds a policy that sets the headers on the local dev proxy', async () => {
    const strategy = await createFusionAiIndexStrategy(
      createModules('http://localhost:3000/@fusion-api/ai', { 'X-Fusion-CLI-Name': 'my-tool' }),
    );
    strategy.createStore({} as IEmbed, 'index');

    expect((await runPolicies()).get('X-Fusion-CLI-Name')).toBe('my-tool');
  });

  it('adds no header policy when no headers are configured', async () => {
    const strategy = await createFusionAiIndexStrategy(createModules('https://ai.example.com'));
    strategy.createStore({} as IEmbed, 'index');

    const options = searchClientCtor.mock.calls[0][3];
    expect(options.additionalPolicies).toEqual([]);
  });
});
