# MSAL — test double

Authenticate in-process instead of against Entra ID.

```typescript
import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';

enableMsalMock(configurator);
```

Import path: `@equinor/fusion-framework-module-msal/mock`. The entry point has **no test-runner dependency**.

## What is substituted

> [!IMPORTANT]
> Only `IMsalClient` — the object that would contact Entra ID. The real `MsalConfigurator`, the real `MsalProvider` and the real schema validation all still run.

That distinction is the point. Scope resolution, silent-first token acquisition, account handling, proxy providers and telemetry stay on the production code path, so a test observes real provider behaviour:

```typescript
const fusion = await mockFramework((configurator) => {
  // the client is configured with *what it talks to*, exactly as in production
  configurator.msal.setClientConfig({ auth: { clientId: 'my-app', tenantId: 'my-tenant' } });
});

const token = await fusion.modules.auth.acquireAccessToken();
// scope is 'my-app/.default' — resolved by the real provider, not by the test double
```

A double that replaced the provider would have skipped that logic and reported whatever it was told to.

## Defaults

A user named `Test User` is signed in. Tokens are real JWTs, minted in-process with a fixed issue time, so they are identical across runs and machines and can be compared or snapshotted directly.

When no client configuration is declared, a stand-in one is used, so an application boots under test without credentials it does not have.

## Custom token acquisition

Inject the token acquisition used by the current test runtime:

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setAcquireToken(async ({ scopes }) => {
    const response = await fetch('http://localhost:4010/@fusion-mock/auth/token', {
      method: 'POST',
      credentials: 'include',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ scopes }),
    });
    if (!response.ok) {
      throw new Error(`Mock auth token acquisition failed with status ${response.status}`);
    }

    const result: unknown = await response.json();
    if (typeof result === 'object' && result !== null && 'status' in result) {
      if (result.status === 'missing') return null;
      if (result.status === 'issued' && 'token' in result && typeof result.token === 'string') {
        return result.token;
      }
    }
    throw new Error('Mock auth token acquisition returned an unsupported status');
  });
});
```

The MSAL mock knows nothing about HTTP, Vite, Playwright, or the mock server. The runtime adapter
receives the requested scopes, current account, and client ID. Its returned token is authoritative:
the client derives its active account from that same token before returning the authentication
result, so the bearer token, result account, client account, and provider account cannot describe
different users.

Returning `null` restores the built-in `fusion-mock-user` fallback. The React app Vitest plugin
installs a deterministic default acquisition function, while the SPA bootstrap installs the
mock-server HTTP adapter.

## Running inside a host application

When the module is hoisted onto a host application's provider — an app inside a portal — no client is built. The app authenticates through the host's client, exactly as in production.

The session is shared, so tokens acquired by the hosted module update the same client and account
observed by the host.

## Mocking an individual call

> [!IMPORTANT]
> That is your test runner's job. This module ships **no mocking API**.

The mock client is a plain class with ordinary methods, so `vi.spyOn`, `bun:test`'s `spyOn` and Node's `t.mock.method` all work on it directly — with their own call assertions, argument matchers and reset semantics, which a framework-specific API would not give you.

The provider exposes the client it authenticates through, so a spy has a stable target:

```typescript
vi.spyOn(fusion.modules.auth.client, 'acquireToken').mockResolvedValue(result);

afterEach(() => vi.restoreAllMocks());
```

## Minting a token directly

For code that only needs a token — an HTTP interceptor test, say — skip the client:

```typescript
import { createMockToken } from '@equinor/fusion-framework-module-msal/mock';

const token = createMockToken({ oid: 'fusion-mock-user' });
```

To use a generated token as the signed-in user for `ffc app dev --mock`, `ffc app serve --mock`,
or a Vite SPA, see
[Generate a mock user and update `.env`](../../../vite-plugins/spa/README.md#generate-a-mock-user-and-update-env).
That workflow documents persistent mock-auth configuration, identity claims, and custom `scp`
token scopes.

## Exports

| Export | Purpose |
| --- | --- |
| `enableMsalMock(configurator, configure?)` | Register the module with an in-process client |
| `msalMockModule` | The module itself, for manual registration |
| `MsalMockConfigurator` | The real configurator, backed by an in-process client |
| `MsalMockClient(config)` | The in-process client, taking the same `MsalClientConfig` as `MsalClient` |
| `createMsalMockClient(config, user?)` | Convenience alias for `new MsalMockClient(config)` |
| `createMockToken(claims?)` | Mint a deterministic JWT |

## Related

- [Module README](../README.md) — production configuration
- [`@equinor/fusion-framework/mock`](../../../framework/docs/testing.md) — mock every framework boundary at once
