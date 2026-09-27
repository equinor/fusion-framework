import { describe, expect, it } from 'vitest';

import { resolveFusion } from '../scope/resolve-fusion.js';

describe('resolveFusion', () => {
  it('does not enable the parent feature-flag mock by default', async () => {
    const fusion = await resolveFusion();

    expect('featureFlag' in fusion.modules).toBe(false);
  });

  it('acquires a default token matching the active mock account', async () => {
    const fusion = await resolveFusion();

    const result = await fusion.modules.auth.acquireToken({
      request: { scopes: ['api://test/.default'] },
    });

    expect(result?.account?.localAccountId).toBe(fusion.modules.auth.account?.localAccountId);
    expect(result?.accessToken.split('.')).toHaveLength(3);
  });

  it('enables the parent feature-flag mock for an app that declares feature flags', async () => {
    const fusion = await resolveFusion({
      runtimeDependencies: ['@equinor/fusion-framework-module-feature-flag'],
    });

    expect('featureFlag' in fusion.modules).toBe(true);
  });
});
