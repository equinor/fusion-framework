import { beforeEach, describe, expect, it, vi } from 'vitest';

const { initializeFramework, enableAI } = vi.hoisted(() => ({
  initializeFramework: vi.fn(),
  enableAI: vi.fn(),
}));

vi.mock('@equinor/fusion-framework-cli/bin', () => ({
  initializeFramework,
  FusionEnv: { ContinuesIntegration: 'ci' },
  defaultHeaders: { 'X-Fusion-CLI-Name': 'fusion-framework-cli' },
}));
vi.mock('@equinor/fusion-framework-module-ai', () => ({ enableAI }));

import { setupFramework } from './setup-framework.js';
import type { AiOptions } from './options/index.js';

const createFramework = (token: string | null = 'token') => ({
  serviceDiscovery: { resolveService: vi.fn(async () => ({ uri: 'https://ai', scopes: ['s'] })) },
  auth: { acquireAccessToken: vi.fn(async () => token) },
});

beforeEach(() => {
  initializeFramework.mockReset();
  enableAI.mockReset();
});

describe('setupFramework', () => {
  it('hands the CLI identification headers to the AI module', async () => {
    initializeFramework.mockImplementation(async (_settings, configure) => {
      configure({ configurator: true });
      return createFramework();
    });
    const setDefaultHeaders = vi.fn();
    enableAI.mockImplementation((_configurator, configure) => configure({ setDefaultHeaders }));

    await setupFramework({ env: 'ci' } as AiOptions);

    expect(setDefaultHeaders).toHaveBeenCalledWith({ 'X-Fusion-CLI-Name': 'fusion-framework-cli' });
  });

  it('fails when no access token can be acquired for the AI service', async () => {
    initializeFramework.mockResolvedValue(createFramework(null));

    await expect(setupFramework({ env: 'ci' } as AiOptions)).rejects.toThrow(
      'Failed to acquire access token',
    );
  });
});
