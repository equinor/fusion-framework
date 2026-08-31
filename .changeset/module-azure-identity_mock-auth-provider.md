---
"@equinor/fusion-framework-module-azure-identity": minor
---

Add `MockAuthProvider`, a configurable `IAuthProvider` test double, exported from a new `/mock` subpath (`@equinor/fusion-framework-module-azure-identity/mock`).

Unlike `token_only` mode's `AuthProviderTokenOnly` — a single fixed token where `login`/`logout` always throw — `MockAuthProvider` actually implements `login`/`logout`: a test can drive the provider from signed-out to signed-in (and back), and control the returned access token and its `expiresOn`, including setting an expiry in the past to exercise a consuming application's own token-refresh logic. No real `@azure/identity` network calls are made.

```typescript
import { enableAuthMock } from '@equinor/fusion-framework-module-azure-identity/mock';

const auth = enableAuthMock(configurator, (auth) => {
  auth.setAccount({ username: 'ada@equinor.com', signedOut: true });
});

await auth.login({ request: { scopes: ['User.Read'] } });
const token = await auth.acquireAccessToken({ request: { scopes: ['User.Read'] } });

// simulate an expired token
auth.setExpiresOn(new Date(Date.now() - 1000));
```

`MockAuthProvider` registers as the `'auth'` module's provider exactly like any real implementation — no special-cased wiring in the module itself. This does not change or replace `token_only` mode, which remains the right choice for CI/CD scenarios needing a static token.

Related: equinor/fusion-core-tasks#1665.
