---
"@equinor/fusion-framework-module-msal": minor
---

Added a `./mock` entry point so applications can run against the auth module without credentials or network access.

```ts
import { enableMsalMock, createMsalMockClient } from '@equinor/fusion-framework-module-msal/mock';

// default mock user
enableMsalMock(configurator);

// or a specific one
enableMsalMock(configurator, (builder) => {
  builder.setAccount({ name: 'Ada Lovelace' });
});
```

Only the MSAL **client** is substituted. `MsalMockClient` resolves tokens in-process and takes the same `MsalClientConfig` as the real `MsalClient`, so `setClientConfig` means the same thing whether a test runs against Entra ID or in-process. `MsalMockConfigurator` builds it through the `_createClient` seam, and `msalMockModule` differs from the real module in its `configure` alone — `initialize` is the production one, untouched, so `MsalProvider`, schema validation and the whole start-up path run exactly as they do in production. `IMsalProvider` and `MsalConfigurator` are untouched.

The same client works with the plain module, without the mock module:

```ts
enableMSAL(configurator, (builder) =>
  builder.setClient(createMsalMockClient({ auth: { clientId: 'my-app' } }, { name: 'Ada Lovelace' })),
);
```

Tokens are structurally valid, unsigned JWTs and are identical between runs. They are not cryptographically valid and are rejected by any real service.

Exports `enableMsalMock`, `msalMockModule`, `MsalMockConfigurator`, `MsalMockClient`, `createMsalMockClient` and `createMockToken`. The entry point has no test-runner dependency.
