---
"@equinor/fusion-framework-module-msal": minor
---

Add a `./mock` entry point so applications can run against the auth module without credentials or
network access.

```ts
import { enableMsalMock } from '@equinor/fusion-framework-module-msal/mock';

enableMsalMock(configurator, (builder) => {
  builder.setAccount({ name: 'Ada Lovelace' });
});
```

Only the MSAL **client** is substituted — `MsalMockClient` resolves tokens in-process from the same
`MsalClientConfig` the real `MsalClient` takes, built through the `_createClient` seam, so
`MsalProvider`, schema validation and the whole start-up path run exactly as they do in production.
Tokens are structurally valid, unsigned JWTs, identical between runs, and are rejected by any real
service.

`MsalMockConfigurator.setAccount(user | null | callback)` declares the signed-in user on the
builder instead of baking it into a client: `null` starts signed out and forgets the identity,
`{ signedOut: true }` starts signed out but keeps it for a later `login()` to resolve. The
declaration is applied to whichever client the module ends up authenticating through — including a
host framework's client when this module is hoisted into a portal — so pairing
`{ signedOut: true }` with `setRequiresAuth(true)` exercises the real automatic login.

`MsalMockConfigurator.setToken(token, skipResolve?)` returns that exact access/id token instead of
one generated from the account's claims, for a backend mock that validates specific claims,
audience or signature. By default it also signs in the account derived from the token's own claims
(`name`, `preferred_username`, `oid`, `tid`, `scp`) via `createMockUserFromToken`; pass
`skipResolve: true` to keep a separately declared account while still returning this token.

`MsalMockClient` keeps a real account cache keyed by `homeAccountId` alongside an active account,
matching MSAL: `getAccount(filter)` matches on `homeAccountId`/`localAccountId`/`username`/`tenantId`,
`getAllAccounts()` returns everything cached, sign-in/sign-out add and remove cache entries instead
of leaving stale ones behind, and `setActiveAccount` accepts an account that was never issued by a
sign-in (added to the cache), so swapping the user between tests is a single line:

```typescript
beforeEach(() => {
  fusion.modules.auth.client.setActiveAccount(account);
});
```

The same client works with the plain (non-mock) module:

```ts
enableMSAL(configurator, (builder) =>
  builder.setClient(createMsalMockClient({ auth: { clientId: 'my-app' } }, { name: 'Ada Lovelace' })),
);
```

Exports `enableMsalMock`, `msalMockModule`, `MsalMockConfigurator`, `MsalMockClient`,
`createMsalMockClient` and `createMockToken`. Does not change or replace `token_only` mode, which
remains the right choice for CI/CD scenarios needing a static token.
