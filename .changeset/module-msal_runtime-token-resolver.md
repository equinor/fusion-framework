---
"@equinor/fusion-framework-module-msal": major
---

Add `MsalMockConfigurator.setAcquireToken` as the single way for test runtimes to provide mock tokens. The MSAL mock now derives the active account from each acquired token, preventing account and bearer-token identities from drifting apart.

**Breaking:** the mock entry point removes `setAccount`, `setToken`, `setUser`, `MsalMockUser`, and the configurable initial-user argument accepted by `createMsalMockClient`. Tests using those APIs should return a token containing the required identity claims instead:

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
    aud: clientId,
    scp: scopes.join(' '),
    name: 'Ada Lovelace',
    preferred_username: 'ada@equinor.com',
    oid: 'ada-lovelace',
  }),
);
```

Production MSAL entry points, configuration, and runtime behavior are unchanged. Zero-configuration tests also continue to start with the built-in `Test User`.

Relates to equinor/fusion-core-tasks#2096
