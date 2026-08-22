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

## Choosing the signed-in user

`MsalMockClient` takes the same `MsalClientConfig` the real `MsalClient` takes — a client configuration has no notion of who is signed in, so the user is declared separately and signed in on the client as it is built:

```typescript
import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';

enableMsalMock(configurator, (builder) => {
  builder.setAccount({ name: 'Ada Lovelace', username: 'ada@equinor.com' });
});
```

Pass `null` when nobody is signed in:

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setAccount(null);
});
```

`setAccount` also takes an ordinary config-builder callback, resolved while the configuration is assembled and handed the same arguments every other builder callback receives:

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setAccount(async ({ hasModule }) => ({
    name: hasModule('app') ? 'App User' : 'Portal User',
  }));
});
```

The user is in place **before** `MsalProvider.initialize()` runs, so the provider's own start-up path acts on it. Combined with `setRequiresAuth(true)`, a test observes the real automatic login rather than a state assigned after the fact.

`setClient` replaces the client, but not the rule: the declared user is signed in on whichever client the module authenticates through, so a mock client supplied that way receives it too.

## Returning an exact token

Most tests only care who is signed in and let the mock fabricate a token from that user's fields. When a backend mock validates the token itself — specific claims, an audience, or a signature — it needs to see the exact token it expects instead:

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setToken(token);
});
```

`setToken` also signs in the user the token's claims describe, via `createMockUserFromToken` — so `acquireAccessToken` returns this token, and the account APIs agree with it. Pass `true` as the second argument to keep a separately declared account instead:

```typescript
enableMsalMock(configurator, (builder) => {
  builder.setAccount({ name: 'Ada Lovelace' }).setToken(token, true);
});
```

| Option | Default | Purpose |
| --- | --- | --- |
| `name` | `Test User` | Display name |
| `username` | `test.user@equinor.com` | UPN / email |
| `userId` | `fusion-mock-user` | Object ID |
| `tenantId` | the client's configured tenant | Tenant |
| `scopes` | `fusion-mock-scope` | Granted when a request specifies none |
| `account` | derived | A preconfigured `AccountInfo` to use outright |
| `signedOut` | `false` | Start without a signed-in user |

The client tokens are issued for comes from the client configuration (`setClientConfig`), not from the user.

### Why the user is signed in at construction

The account is put in the client's cache as the client is built — before the provider exists. That reproduces the production shape of a returning user with a live session: the provider finds an account already there and takes the branch it takes in the browser.

Assigning the account **after** `MsalProvider.initialize()` — from an `onInitialized` hook, say — looks equivalent but is not. `initialize()` exchanges an auth code, calls `handleRedirect()` and, when `requiresAuth` is set, performs an automatic login. A late assignment silently overwrites all of that, so a test asserting on the sign-in journey would be observing its own assignment rather than the framework.

## Changing the user between tests

When a suite shares one framework instance but needs a different user per test, set the active account directly:

```typescript
beforeEach(() => {
  fusion.modules.auth.client.setActiveAccount(account);
});
```

The mock keeps a real account cache, so this behaves the way MSAL does: `getActiveAccount`, `getAllAccounts` and `getAccount(filter)` all agree afterwards. Unlike real MSAL, an account that was never issued by a sign-in is accepted and added to the cache, which is what makes the one-liner above possible.

Signing out (`logout`, `logoutPopup`, `logoutRedirect`) removes the account from the cache rather than merely deactivating it, as MSAL does.

## Running inside a host application

When the module is hoisted onto a host application's provider — an app inside a portal — no client is built. The app authenticates through the host's client, exactly as in production.

A user declared with `setAccount` is still honoured: it is signed in on the **host's** client, because that is the client the app authenticates through. The alternative would be for `setAccount` to silently do nothing precisely when an app is being tested inside a portal.

The session is shared, so this changes who the host sees signed in too — as it does in production. If the host does not authenticate through a mock client, `setAccount` throws rather than failing quietly.

## Testing signed-out behaviour

Both `null` and `signedOut: true` start without a session. Silent flows then resolve empty so the provider follows its unauthenticated path, while an explicit login still succeeds — which lets a test drive the sign-in journey rather than only its end state.

They differ in what the login resolves to. `null` forgets the identity, so a login produces the default user:

```typescript
builder.setAccount(null);
```

`signedOut: true` keeps it, so a login produces the user the test named — which is what to reach for when the assertion is about *who* signed in:

```typescript
builder.setAccount({ name: 'Ada Lovelace', signedOut: true });
```

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
