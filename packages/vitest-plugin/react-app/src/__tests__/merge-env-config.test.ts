import { AppConfig } from '@equinor/fusion-framework-module-app';
import type { AppEnv } from '@equinor/fusion-framework-app';
import { describe, expect, it } from 'vitest';

import { mergeEnvConfig } from '../merge-env-config.js';

describe('mergeEnvConfig', () => {
  const baseEnv: AppEnv = {
    manifest: {
      appKey: 'test-app',
      displayName: 'Test App',
      description: 'A test application',
      type: 'standalone',
    },
    config: new AppConfig({
      environment: { foo: 'bar' },
      endpoints: { api: { url: 'https://api.example.com', scopes: ['api.read'] } },
    }),
  };

  it('adds a new endpoint without dropping existing ones', () => {
    const merged = mergeEnvConfig(baseEnv, {
      endpoints: { 'cpr-api': { url: 'https://cpr.example.com' } },
    });

    expect(merged.config?.endpoints).toEqual({
      api: { url: 'https://api.example.com', scopes: ['api.read'] },
      'cpr-api': { url: 'https://cpr.example.com', scopes: [] },
    });
  });

  it('overrides one field of an existing endpoint, keeping the rest', () => {
    const merged = mergeEnvConfig(baseEnv, {
      endpoints: { api: { url: 'https://fake.example.com' } },
    });

    expect(merged.config?.endpoints.api).toEqual({
      url: 'https://fake.example.com',
      scopes: ['api.read'],
    });
  });

  it('merges environment overrides over the existing environment', () => {
    const merged = mergeEnvConfig(baseEnv, { environment: { baz: 'qux' } });

    expect(merged.config?.environment).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('leaves the original env and its config untouched', () => {
    mergeEnvConfig(baseEnv, { endpoints: { api: { url: 'https://fake.example.com' } } });

    expect(baseEnv.config?.endpoints.api).toEqual({
      url: 'https://api.example.com',
      scopes: ['api.read'],
    });
  });

  it('handles an env with no existing config', () => {
    const env: AppEnv = { manifest: baseEnv.manifest };
    const merged = mergeEnvConfig(env, { endpoints: { api: { url: 'https://api.example.com' } } });

    expect(merged.config?.endpoints).toEqual({
      api: { url: 'https://api.example.com', scopes: [] },
    });
    expect(merged.config?.environment).toEqual({});
  });
});
