import { describe, expect, it, vi } from 'vitest';

import { mockFramework } from '@equinor/fusion-framework/mock';
import type { AuthenticationResult } from '@equinor/fusion-framework-module-msal';

import { mockAppModules } from '../../mock/mock-app-modules.js';

const env = {
  manifest: {
    appKey: 'test-app',
    displayName: 'Test App',
    description: 'A test application',
    type: 'standalone' as const,
  },
};

describe('msal hoisting', () => {
  it('delegates acquireToken to the parent’s auth module instead of building its own client', async () => {
    const fusion = await mockFramework();
    const result = { accessToken: 'parent-issued-token' } as AuthenticationResult;
    vi.spyOn(fusion.modules.auth, 'acquireToken').mockResolvedValue(result);

    const modules = await mockAppModules(undefined, env, fusion);

    // the app's own `auth` is a distinct (proxying) object, not the parent's instance itself
    expect(modules.auth).not.toBe(fusion.modules.auth);
    await expect(
      modules.auth.acquireToken({ request: { scopes: ['User.Read'] } }),
    ).resolves.toMatchObject({ accessToken: 'parent-issued-token' });
  });

  it('surfaces the parent’s acquisition failures instead of falling back to its own client', async () => {
    const fusion = await mockFramework();
    vi.spyOn(fusion.modules.auth, 'acquireToken').mockRejectedValue(new Error('acquisition failed'));

    const modules = await mockAppModules(undefined, env, fusion);

    await expect(
      modules.auth.acquireToken({ request: { scopes: ['User.Read'] } }),
    ).rejects.toThrow('acquisition failed');
  });

  it('reflects the parent’s signed-in account rather than signing in its own', async () => {
    const fusion = await mockFramework((configurator) => {
      configurator.msal.setAccount({ name: 'Ada Lovelace' });
    });

    const modules = await mockAppModules(undefined, env, fusion);

    expect(modules.auth.account?.name).toBe('Ada Lovelace');
  });
});
