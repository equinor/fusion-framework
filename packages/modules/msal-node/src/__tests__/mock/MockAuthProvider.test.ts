import { describe, expect, it } from 'vitest';
import { ModulesConfigurator } from '@equinor/fusion-framework-module';

import { module as realModule } from '../../module';
import type { IAuthProvider } from '../../AuthProvider.interface';
import { createAuthMockModule, enableAuthMock, MockAuthProvider } from '../../mock';

describe('MockAuthProvider', () => {
  it('is signed in with a default identity out of the box', async () => {
    const auth = new MockAuthProvider();

    const result = await auth.acquireToken({ request: { scopes: ['User.Read'] } });

    expect(result.accessToken).toBeDefined();
    expect(result.expiresOn).toBeNull();
    expect(result.account?.username).toBe('test.user@equinor.com');
  });

  it('throws from acquireToken/acquireAccessToken when constructed signedOut', async () => {
    const auth = new MockAuthProvider({ signedOut: true });

    await expect(auth.acquireToken({ request: { scopes: [] } })).rejects.toThrow(/not signed in/);
    await expect(auth.acquireAccessToken({ request: { scopes: [] } })).rejects.toThrow(
      /not signed in/,
    );
  });

  it('signs in on login, resolving the configured identity', async () => {
    const auth = new MockAuthProvider({
      signedOut: true,
      account: { username: 'ada@equinor.com' },
    });

    const result = await auth.login({ request: { scopes: ['User.Read'] } });

    expect(result.account?.username).toBe('ada@equinor.com');
    await expect(
      auth.acquireAccessToken({ request: { scopes: ['User.Read'] } }),
    ).resolves.toBeDefined();
  });

  it('signs out on logout, without discarding the identity for a later login', async () => {
    const auth = new MockAuthProvider();

    await auth.logout();
    await expect(auth.acquireToken({ request: { scopes: [] } })).rejects.toThrow(/not signed in/);

    const result = await auth.login({ request: { scopes: [] } });
    expect(result.account?.username).toBe('test.user@equinor.com');
  });

  it('setAccount merges identity fields and can flip the signed-in state', async () => {
    const auth = new MockAuthProvider();

    auth.setAccount({ username: 'ada@equinor.com', signedOut: true });

    await expect(auth.acquireToken({ request: { scopes: [] } })).rejects.toThrow(/not signed in/);

    const result = await auth.login({ request: { scopes: [] } });
    expect(result.account?.username).toBe('ada@equinor.com');
  });

  it('setAccessToken replaces the token returned by acquireToken/acquireAccessToken', async () => {
    const auth = new MockAuthProvider();

    auth.setAccessToken('a-different-token');

    const result = await auth.acquireToken({ request: { scopes: [] } });
    expect(result.accessToken).toBe('a-different-token');
    await expect(auth.acquireAccessToken({ request: { scopes: [] } })).resolves.toBe(
      'a-different-token',
    );
  });

  it('setExpiresOn lets a test simulate an already-expired token', async () => {
    const auth = new MockAuthProvider();
    const past = new Date(Date.now() - 1000);

    auth.setExpiresOn(past);

    const result = await auth.acquireToken({ request: { scopes: [] } });
    expect(result.expiresOn).toEqual(past);
    expect(result.expiresOn?.getTime()).toBeLessThan(Date.now());
  });
});

describe('createAuthMockModule', () => {
  it('shares the real module name, so it is a drop-in replacement for the "auth" slot', () => {
    const mod = createAuthMockModule();

    expect(mod.name).toBe(realModule.name);
  });

  it('registers the given MockAuthProvider as the module config, unchanged', () => {
    const auth = new MockAuthProvider({ account: { username: 'ada@equinor.com' } });
    const mod = createAuthMockModule(auth);

    expect(mod.configure?.()).toBe(auth);
  });
});

describe('enableAuthMock', () => {
  it('initializes the "auth" module as the MockAuthProvider it registered', async () => {
    const configurator = new ModulesConfigurator([]);
    const auth = enableAuthMock(configurator);

    const instances = await configurator.initialize();

    expect((instances as unknown as { auth: IAuthProvider }).auth).toBe(auth);
  });

  it('replaces an auth module that is already registered', async () => {
    // A FrameworkConfigurator pre-registers the real auth module, so the mock is
    // only useful if registering it afterwards wins
    const configurator = new ModulesConfigurator([realModule]);
    enableAuthMock(configurator, (auth) => auth.setAccount({ username: 'ada@equinor.com' }));

    const instances = await configurator.initialize();
    const result = await (instances as unknown as { auth: IAuthProvider }).auth.login({
      request: { scopes: [] },
    });

    expect(result.account?.username).toBe('ada@equinor.com');
  });
});
