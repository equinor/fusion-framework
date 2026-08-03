---
"@equinor/fusion-framework-module-msal": minor
---

Give `MsalMockClient` a real account cache, so its account APIs agree with each other and with MSAL.

Previously the client held a single nullable account, which made its surface inconsistent: `getAccount(filter)` ignored the filter, `getAllAccounts()` reported an account even after one had only been made active, and signing out merely blanked a field.

The client now keeps a cache keyed by `homeAccountId` alongside an active account, matching MSAL:

- `getAccount(filter)` matches on `homeAccountId`, `localAccountId`, `username` and `tenantId`.
- `getAllAccounts()` returns everything cached.
- Signing in adds the account and activates it; signing out removes it, rather than leaving a stale entry behind.
- `setUser` replaces the session, so declaring a second user never leaves two accounts cached.

`setActiveAccount` deliberately departs from MSAL in one respect: an account that was never issued by a sign-in is accepted and added to the cache. That makes swapping the user between tests a single line, without rebuilding the framework:

```typescript
beforeEach(() => {
  fusion.modules.auth.client.setActiveAccount(account);
});
```
