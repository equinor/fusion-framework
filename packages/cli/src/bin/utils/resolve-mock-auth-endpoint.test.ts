import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { resolveMockAuthEndpoint } from './resolve-mock-auth-endpoint.js';

describe('resolveMockAuthEndpoint', () => {
  let root: string;

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'ffc-mock-auth-'));
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    rmSync(root, { recursive: true, force: true });
  });

  it('returns undefined when mock auth is not enabled', () => {
    expect(resolveMockAuthEndpoint({ mode: 'development', root })).toBeUndefined();
  });

  it('falls back to the default mock server when only FUSION_SPA_MSAL_MOCK is set', () => {
    vi.stubEnv('FUSION_SPA_MSAL_MOCK', 'true');

    expect(resolveMockAuthEndpoint({ mode: 'development', root })).toBe('http://localhost:4010');
  });

  it('uses FUSION_SPA_MSAL_MOCK_SERVER_URL from a .env file', () => {
    writeFileSync(
      join(root, '.env'),
      'FUSION_SPA_MSAL_MOCK=true\nFUSION_SPA_MSAL_MOCK_SERVER_URL=http://localhost:5010\n',
    );

    expect(resolveMockAuthEndpoint({ mode: 'development', root })).toBe('http://localhost:5010');
  });

  it('ignores values other than the literal "true", like the SPA bootstrap', () => {
    vi.stubEnv('FUSION_SPA_MSAL_MOCK', '1');

    expect(resolveMockAuthEndpoint({ mode: 'development', root })).toBeUndefined();
  });
});
