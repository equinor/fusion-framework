---
"@equinor/fusion-framework-module-msal": minor
---

Add `MsalMockConfigurator.setAcquireToken` as the single way for test runtimes to provide mock tokens. The MSAL mock now derives the active account from each acquired token, preventing account and bearer-token identities from drifting apart.

Tests using `setAccount`, `setToken`, `setUser`, or a configurable initial mock user should return a token containing the required identity claims instead:

```typescript
// Before
configurator.msal.setAccount({
  name: 'Ada Lovelace',
  username: 'ada@equinor.com',
});

// After
import { createMockToken } from '@equinor/fusion-framework-module-msal/mock';

configurator.msal.setAcquireToken(({ clientId, scopes }) =>
  createMockToken({
    clientId,
    scopes,
    claims: {
      name: 'Ada Lovelace',
      preferred_username: 'ada@equinor.com',
      oid: 'ada-lovelace',
    },
  }),
);
```

This is a minor release rather than a production breaking change because these APIs exist only in the opt-in `@equinor/fusion-framework-module-msal/mock` testing entry point. The production MSAL entry points, configuration, and runtime behavior are unchanged. Zero-configuration tests also continue to start with the built-in `Test User`.

Relates to equinor/fusion-core-tasks#2096
